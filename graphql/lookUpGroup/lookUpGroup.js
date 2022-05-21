const { ApolloError } = require("apollo-server-errors");
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");
const errorList = require("../../module/errorList");

// 그룹 조회 페이지
module.exports = {
  Query: {
    lookUpGroup: async (_, info) => {
      try {
        // 그룹이름이 없으면 봉사 그룹 신청인원에 따라 10개 반환하기
        if (!info.groupName && !info.searchAddress) {
          const nullGroupNameSql = `select * from groupInfo order by applyPeopleNumber desc limit 0,10;`;
          let nullGroupNameValue = [info.groupName];
          const nullGroupNameData = await pool.getData(
            nullGroupNameSql,
            nullGroupNameValue
          );
          return nullGroupNameData[0];
        }

        // 그룹이름이 들어왔을 경우 `%${area}%` : "%영등포구%" 페이지 네이션 기능 추가
        let parserNameSearch = info.groupName ? `%${info.groupName}%` : "%";
        // 그룹 이름 주소 검색일 경우
        let searchAddress = info.searchAddress
          ? `%${info.searchAddress}%`
          : "%";
        // 페이지가 없으면 0부터 있으면 -1 하고 뛰어넘을 그룹 개수 만큼 *해주기
        const pageNumber = info.pageNum ? (Number(info.pageNum) - 1) * 10 : 0;

        // 쿼리 날리는 곳
        const lookUpGroupNameSql =
          //   "select * from groupInfo where addressGroupInfo like ? limit ?, 10;";
          "select * from groupInfo where groupName like ? and addressGroupInfo like ? limit ?, 10;";

        let lookUpGroupNameValue = [
          parserNameSearch,
          searchAddress,
          pageNumber,
        ];

        const lookUpGroupNameResult = await pool.getData(
          lookUpGroupNameSql,
          lookUpGroupNameValue
        );

        console.log("조회 결과 확인하기 :::", lookUpGroupNameResult[0]);
        return lookUpGroupNameResult[0];
      } catch (err) {
        console.log("그룹 조회 에러 :::", err);
        return errorList.returnError("서버 에러", 500);
      }
    },
  },
};

// 인원수를 그룹테이블에 저장하고 그룹 신청시마다 인원수를 올려야한다.ApolloErrorupdate 테이블명 set 컬럼명 = 컬럼명+ 1
// 이러면 적으신 컬럼명의 값이 모두 +1됩니다.
// update 테이블명 set 컬럼명 = 컬럼명+ 1 where 컬럼명 = 값 // 컬럼명이 값이면 1을 더함
// 예) 조회수
// update board set count = count + 2 where num = '7'
// num이 7이라는 값을 가진 열의 count라는 행에 2를 더해줌
// 다대다 테이블은 너무 데이터를 조회하는 값이 크다
// 비용이 어마어마하게 들꺼 같다.
