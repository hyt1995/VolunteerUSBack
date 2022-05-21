const { ApolloError } = require("apollo-server-errors");
const pool = require("../../module/mysql2");
const date = require("date-and-time");
const errorList = require("../../module/errorList");

module.exports = {
  Query: {
    infoListResponse: async (_, info) => {
      try {
        // 쿼리 부분
        let whereQuery = "";

        // 값이 있으면 쿼리에 추가된다.
        const queryString = [
          "postAdres",
          "progrmTitle",
          "teenPossible",
          "adultPossible",
          "groupPossible",
        ];

        // 시작 날짜가 들어오지 않으면 오늘 날짜를 넣어준다.
        if (!info.progrmBeginDate) {
          const day = date.format(new Date(), "YYYYMMDD");
          whereQuery = `progrmEndDate > ${day}`;
        } else {
          // 20220507 형식이 아닐경우 빈배열을 보내준다.
          if (!info.progrmBeginDate.length === 8) {
            return errorList.returnError("날짜형식을 다시 확인해주세요", 400);
          }
          // 들어온값을 넣어준다.
          whereQuery = `progrmEndDate > ${info.progrmBeginDate}`;
        }

        // 검색 값이 들어올경우에만 쿼리에 추가한다.
        for (let n = 0; n < queryString.length; n++) {
          const arrayValue = queryString[n];

          // 검색 값이 들어오면 쿼리에 추가해준다.
          if (arrayValue === "postAdres" && info[arrayValue]) {
            whereQuery += ` and postAdres like "%${info[arrayValue]}%"`;
          }
          // 봉사 제목으로 검색값이 들어왔을 경우
          else if (arrayValue === "progrmTitle" && info[arrayValue]) {
            whereQuery += ` and progrmTitle like "%${info[arrayValue]}%"`;
          }
          // 나머지 모집 대상값이 들어왔을 경우
          else if (info[arrayValue]) {
            console.log("뭐가 들어오는지 :::", arrayValue, info[arrayValue]);
            whereQuery += ` and ${arrayValue} = ${info[arrayValue]}`;
          }
        }

        pageNumberQuery = info.pageNumber
          ? (Number(info.pageNumber) - 1) * 10
          : 0;

        // DB 에서 데이터 불러와서 반환해주기 쿼리
        const sql = `select * from volunteerInfo where ${whereQuery} limit ? , 10;`;

        let queryValue = [pageNumberQuery];

        const result = await pool.getData(sql, queryValue);

        console.log("결과값도 같이 ::::", result[0]);
        return result[0];
      } catch (err) {
        console.log("여기서 에러 발생 :::", err);
        return err;
      }
    },
  },
};
