const { ApolloError } = require("apollo-server-errors");
const pool = require("../../module/mysql2");

module.exports = {
  Mutation: {
    wirteComment: async (_, info, context) => {
      try {
        // 로그인을 안했을 경우
        if (!context.data) {
          throw new ApolloError("10005");
        }

        // 모집기관 아이디 검사하기
        const lookUpResult = await lookUpAgency(info.mnntId);

        if (!lookUpResult[0][0]) {
          throw new ApolloError("10005");
        }

        // 코멘트 저장하기
        const sql = `insert into comment (agencyId, writeUserId, commentText, createdAtComText) values (?, ?, ?, ?);`;

        const date = new Date();

        const queryValue = [
          info.mnntId,
          context.data.userNum,
          info.commentText,
          date,
        ];

        const result = await pool.getData(sql, queryValue);

        console.log("코멘트 테이블 저장 결과 확인 :::", result);

        return true;
      } catch (err) {
        console.log("여기서 코멘트 작성 에러 ::::", err);
        throw new ApolloError(err["message"], err["message"]);
      }
    },
  },
};

// 모집기관이 실제로 존재하는지 확인
const lookUpAgency = async (sendId) => {
  const sql = `select id , mnnstNm from recruitAgency where id = ?;`;

  const queryValue = [sendId];

  return await pool.getData(sql, queryValue);
};
