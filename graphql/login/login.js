const { ApolloError } = require("apollo-server-errors");
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");
const errorList = require("../../module/errorList");

module.exports = {
  Query: {
    login: async (_, { id, password }) => {
      try {
        // 아이디 비밀번호가 없을 경우
        if (!id || !password) {
          return errorList.returnError("정보를 다시 확인해주세요", 400);
        }

        // 비밀번호 변경
        transPassword = crypto
          .createHash("sha512")
          .update(password)
          .digest("base64");

        // 아이디 비번일 맞을 경우
        const sql = `SELECT id, userName FROM users WHERE userId = ? AND password= ?;`;

        let queryValue = [
          id,
          transPassword,
          // password
        ];

        const resultLogin = await pool.getData(sql, queryValue);

        if (!resultLogin[0][0]) {
          return errorList.returnError("아이디를 다시 확인해주세요", 403);
        }

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
        return err;
      }
    },
  },
};
