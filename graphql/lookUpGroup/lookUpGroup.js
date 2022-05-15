const { ApolloError } = require('apollo-server-errors');
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");


// 그룹 조회 페이지
module.exports = {
    Query : {
        lookUpGroup : async (_, info) => {

            try {

                // 그룹이름이 없으면 봉사 그룹 신청인원에 따라 10개 반환하기
                if(!info.groupName) {
                    const nullGroupNameSql = `select * from groupInfo order by applyPeopleNumber desc limit 0,5;`;
                    let nullGroupNameValue = [
                        info.groupName
                    ];
                    const nullGroupNameData = await pool.getData(nullGroupNameSql, nullGroupNameValue);
                    return nullGroupNameData[0];
                }

                // 조회된 아이디가 있을 경우 `%${area}%` : "%영등포구%"
                let parserAddress = `%${info.groupName}%`;
                const lookUpGroupNameSql = "select * from groupInfo where groupName like ? limit 0, 10";
                // const sql = "select * from volunteerInfo where progrmBeginDate >= ? and progrmEndDate <= ? and postAdres like ? limit ? , 5;";

                let lookUpGroupNameValue = [
                    parserAddress
                ];

                const lookUpGroupNameResult = await pool.getData(lookUpGroupNameSql, lookUpGroupNameValue);

                console.log("조회된 아이디가 없을 경우 :::", lookUpGroupNameResult[0]);
                return lookUpGroupNameResult[0];

            } catch (err) {
                console.log("그룹 조회 에러 :::", err);
                return new ApolloError("그룹 조회 에러입니다.");
            }
        }
    }
}



// 인원수를 그룹테이블에 저장하고 그룹 신청시마다 인원수를 올려야한다.ApolloErrorupdate 테이블명 set 컬럼명 = 컬럼명+ 1
// 이러면 적으신 컬럼명의 값이 모두 +1됩니다.
// update 테이블명 set 컬럼명 = 컬럼명+ 1 where 컬럼명 = 값 // 컬럼명이 값이면 1을 더함
// 예) 조회수
// update board set count = count + 2 where num = '7'
// num이 7이라는 값을 가진 열의 count라는 행에 2를 더해줌
// 다대다 테이블은 너무 데이터를 조회하는 값이 크다 
// 비용이 어마어마하게 들꺼 같다.