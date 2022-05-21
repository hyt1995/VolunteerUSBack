const { ApolloError } = require("apollo-server-errors");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");
const errorList = require("../../module/errorList");

module.exports = {
  Mutation: {
    userApplyToGroup: async (_, info, context) => {
      try {
        // 들어온 정보 확인하기
        if (!info.applyGroupId) {
          return errorList.returnError("정보를 다시 확인해주세요", 400);
        }
        // 토큰으로 유저 정보 확인
        const user = auth.authToken.get(context.token);

        if (user === false) {
          return errorList.returnError("유효한 토큰이 아닙니다.", 403);
        }

        // 그룹 아이디, 유저 아이디로 groupApply에 정보 저장하기
        const applyGroupSql = `insert into groupApply(applyUserId, applyGroupId) values (?, ?);`;
        let applyGroupValue = [user.userNum, info.applyGroupId];
        const applyGroupData = await pool.getData(
          applyGroupSql,
          applyGroupValue
        );

        console.log("유저가 그룹 들어가기 신청 결과 확인 :::", applyGroupData);

        return true;
      } catch (err) {
        console.log("유저 그룹 신청 에러 :::", err);
        return err;
      }
    },
  },
};
