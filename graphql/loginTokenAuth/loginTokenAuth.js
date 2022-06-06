const { ApolloError } = require("apollo-server-errors");
const auth = require("../../module/auth");
const errorList = require("../../module/errorList");

module.exports = {
  Query: {
    loginTokenAuth: async (_, info, context) => {
      try {
        // 토큰이 유효하지 않을 경우
        if (!context.data) {
          throw new ApolloError("10006");
        }
        return {
          token: context.token,
          userName: context.data.userName,
          id: context.data.loginId,
        };
      } catch (err) {
        throw new ApolloError(err["message"], err["message"]);
      }
    },
  },
};
