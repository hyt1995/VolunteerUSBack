const { ApolloError } = require('apollo-server-errors');
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");

// 그룹 신청 페이지 - 대표자 이름으로 조회에서 대표자 아이디도 같이 넣어야함
// 그룹이름 겹치지 않게 그룹이름 조회하는 기능도 넣어야함
module.exports = {
    Mutation : {
        groupApply : async (_, info) => {
            try {
                // 정보가 없으면 에러 반환
                if( !info.groupName, !info.repreName, !info.limit, !info.groupGreeting, !info.groupExplane ){
                    throw new ApolloError("정보를 다시 확인해주세요", "이상한 아이디", {
                        message: "id"
                    });
                };

                // 여기서 토큰을 변화해서 유저 아이디와 닉네님 px를 알아내야한다.

                // 대표자 이름으로 아이디를 우선 조회한다.
                const lookUpSql = `select id from users where userName = ?`;

                let lookUpValue = [
                    info.repreName
                ];

                const lookUpResult = await pool.getData(lookUpSql, lookUpValue);


                if(lookUpResult[0].length === 0){
                    throw new ApolloError("대표명을 확인해주세요", "이상한 아이디", {
                        message: "id"
                    });
                };

                // 그룹이름 조회하는 페이지
                const groupNameLookUpSql = `select id from groupInfo where groupName = ?`;
    
                let groupNameLookUpValue = [
                    info.groupName,
                ];
    
                const groupNameLookUpResult = await pool.getData(groupNameLookUpSql, groupNameLookUpValue);

                // // 이름이 있을 경우 신청 불가를 알린다.
                if(groupNameLookUpResult[0].length !== 0){
                    throw new ApolloError("그룹명이 이미 있습니다.", "이상한 아이디", {
                        message: "id"
                    });
                }

                // 이름이 없으므로 신청이 가능
                // DB에 데이터 저장
                const sql = `insert into groupInfo (groupName, representName, limitPeople, groupGreeting, groupExplain, userId) values (?, ?, ?, ?, ?, ? ) `;
    
                let queryValue = [
                    info.groupName,
                    info.repreName,
                    info.limit,
                    info.groupGreeting,
                    info.groupExplane,
                    lookUpResult[0][0].id
                ];
    
                const result = await pool.getData(sql, queryValue);

                return true;


            } catch (err) {
                console.log("그룹신청 에러 :::", err);
                return err;
            }
        }
    }
}