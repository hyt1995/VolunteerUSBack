const { ApolloError } = require('apollo-server-errors');
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");

module.exports = {
    Mutation : {
        userApplyToGroup : async (_, info) => {
            try {

                // 들어온 정보 확인하기
                if( !info.applyGroupName || !info.applyUserName ){
                    throw new ApolloError("정보를 다시 한번 확인해주세요", "이상한 아이디", {
                        message: "id"
                    });                    
                }
                // 유저 이름으로 유저 아이디 가져오기
                const userNameSql = `select id from users where userName = ?;`;
                let userNameValue = [
                    info.applyUserName
                ];
                const userNameData =  await pool.getData(userNameSql, userNameValue);
                console.log("여기서 유저 아이디 확인 ::::", userNameData);
                // 아이디가 없을 경우 에러를 
                if(userNameData[0].length === 0){
                    throw new ApolloError("유저 다시 한번 확인해주세요", "이상한 아이디", {
                        message: "id"
                    });   
                }


                // 그룹이름으로 아이디 찾기
                const groupNameSql = `select id from groupInfo where groupName = ?;`;
                let groupNameValue = [
                    info.applyGroupName
                ];
                const groupNameData =  await pool.getData(groupNameSql, groupNameValue);
                console.log("여기서 그룹이름으로 그룹아이디 가져오기 결과 확인 :::", groupNameData);

                if(groupNameData[0].length === 0){
                    throw new ApolloError("그룹이름을 다시 한번 확인해주세요", "이상한 아이디", {
                        message: "id"
                    });   
                }

                // 그룹 아이디, 유저 아이디로 groupApply에 정보 저장하기
                const applyGroupSql = `insert into (applyUserId, applyGroupId) values (?, ?);`;
                let applyGroupValue = [
                    userNameData[0][0].id,
                    groupNameData[0][0].id
                ];
                const applyGroupData =  await pool.getData(applyGroupSql, applyGroupValue);

                console.log("유저가 그룹 들어가기 신청 결과 확인 :::", applyGroupData);

                return true;
                
            } catch (err) {
                console.log("유저 그룹 신청 에러 :::", err);
                return err;
            }
        }
    }
}