const { ApolloError } = require("apollo-server-errors");
const auth = require("../../module/auth");
const errorList = require("../../module/errorList");

module.exports = {
  Query: {
    loginTokenAuth: async (_, info, context) => {
      try {
        const user = auth.authToken.get(context.token);

        if (user === false) {
          return errorList.returnError("유효한 토큰이 아닙니다.", 403);
        }

        return {
          token: context.token,
          userName: user.userName,
          id: user.loginId,
        };
      } catch (err) {
        console.log("토큰 로그인 에러 ::::", err);
        return err;
      }
    },
  },
};
