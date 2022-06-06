const { ApolloError } = require("apollo-server-errors");
const pool = require("../../module/mysql2");
const date = require("date-and-time");

module.exports = {
  Mutation: {
    applyVoluntedInfo: async (_, info, context) => {
      try {
        // 봉사 등록번호가 안넘왔을 경우
        if (!info.registNo) {
          throw new ApolloError("10005");
        }

        // 회원가입이 안되어있을 경우
        if (!context.data) {
          throw new ApolloError("10016");
        }

        const joinSql = `insert into applyVolunteerInfo (registNoApply, userIdApply) values(?, ?);`;

        let joinQueryValue = [info.registNo, context.data.userNum];

        const joinResult = await pool.getData(joinSql, joinQueryValue);
        console.log("봉사 상세 조회 값 확인 :::", joinResult[0]);

        return true;
      } catch (err) {
        console.log("봉사 신청 에러 :::", err);
        throw new ApolloError(err["message"], err["message"]);
      }
    },
  },
};
