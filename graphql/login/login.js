const { ApolloError } = require("apollo-server-errors");
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");

module.exports = {
  Query: {
    login: async (_, { id, password }) => {
      try {
        // 아이디 비밀번호가 없을 경우
        if (!id || !password) {
          throw new ApolloError("10005");
        }

        // 비밀번호 변경
        transPassword = crypto
          .createHash("sha512")
          .update(password)
          .digest("base64");

        // 아이디 비번일 맞을 경우
        const sql = `select id, userName from users where userId = ? and password= ?;`;

        let queryValue = [id, transPassword];

        const resultLogin = await pool.getData(sql, queryValue);

        if (!resultLogin[0][0]) {
          throw new ApolloError("10005");
        }

        // 토큰으로 변환
        let authToken = auth.authToken.member.set({
          weatherMerber: true,
          userNum: resultLogin[0][0].id,
          loginId: id,
          userName: resultLogin[0][0].userName,
        });

        return {
          token: authToken,
          id: id,
          userName: resultLogin[0][0].userName,
        };
      } catch (err) {
        console.log("여기서 에러 발생");
        throw new ApolloError(err["message"], err["message"]);
      }
    },
  },
};
