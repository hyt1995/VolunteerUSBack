const { ApolloError } = require('apollo-server-errors');
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");


// 그룹 조회 페이지
module.exports = {
    Query : {
        lookUpGroup : async (_, info) => {

            try {

                // 우선 정보가 없으면 에러처리
                // if (!info.groupName){
                //     throw new ApolloError("정보를 다시 확인해주세요", "이상한 아이디", {
                //         message: "id"
                //     });
                // };
                // // 그룹 10개 불러오는데 신청한 사람이 많은 순서대로 불러오기
                // const sql = `select * from groupInfo left join users on users.id = userVolunteer.userId left join coupon on coupon.userId = users.id where users.id = 3;`;
                // let queryValue = [
                //     info.id
                // ];
                // const resultData = await pool.getData(sql, queryValue);
                // return "dfdfdfdf";

                





                


                // 그룹이름잉 없으면 봉사 그룹 신청인원에 따라 10개 반환하기
                if(!info.groupName) {
                    const nullGroupNameSql = `select * from groupInfo left join on groupid = ? limit order by desc 0,10 ;`;
                    let nullGroupNameValue = [
                        info.id
                    ];
                    const nullGroupNameData = await pool.getData(nullGroupNameSql, nullGroupNameValue);

                    console.log("조회된 아이디가 없을 경우 :::", nullGroupNameData);
                }

                // 조회된 아이디가 있을 경우
                const nullGroupNameSql = `select * from groupInfo left join on groupid = ? limit order by desc 0,10 ;`;
                let nullGroupNameValue = [
                    info.id
                ];
                const nullGroupNameData = await pool.getData(nullGroupNameSql, nullGroupNameValue);

                console.log("조회된 아이디가 없을 경우 :::", nullGroupNameData);


                // 봉사 그룹 타입으로 반환을 해야한다.
                // 배열로 봉사정보를 리턴한다.

            } catch (err) {
                console.log("그룹 조회 에러 :::", err);
                return err;
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