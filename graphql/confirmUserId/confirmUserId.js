const { ApolloError } = require("apollo-server-errors");
const pool = require("../../module/mysql2");

module.exports = {
  Query: {
    confirmUserId: async (_, { id }) => {
      try {
        // 아이디가 넘어 오지 않았을 경우
        if (!id) {
          throw new ApolloError("10005");
        }

        if (id === "tak!") {
          throw new ApolloError("10005");
        }

        // 아이디 검사
        const sql = `SELECT id FROM users WHERE userId = ?;`;
        let queryValue = [id];
        const resultData = await pool.getData(sql, queryValue);

        // 아이디가 없는 경우
        if (!resultData[0][0]) {
          return true;
        }
        //  아이디가 있는 경우
        return false;
      } catch (err) {
        console.log("로그인 아이디 확인 에러 ::::", err);
        throw new ApolloError(err["message"], err["message"]);
      }
    },
  },
};
