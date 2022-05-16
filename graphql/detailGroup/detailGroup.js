const { ApolloError } = require("apollo-server-errors");
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");

// 그룹상세조회 페이지
module.exports = {
  Query: {
    detailGroup: async (_, info) => {
      try {
        // 그룹 이름이 안들어왔을 경우
        if (!info.groupId) {
          throw new ApolloError(
            "그룹아이디가 넘어오지 않았습니다.",
            "이상한 아이디",
            {
              message: "id",
            }
          );
        }

        const groupDetailSql = `select * from groupInfo left join groupApply on applyGroupId = ? where groupInfo.id = ?`;

        let groupDetailValue = [info.groupId, info.groupId];

        const groupDetailValueResult = await pool.getData(
          groupDetailSql,
          groupDetailValue
        );

        console.log(
          "여기서 가져온 정보를 확인 ::: ",
          groupDetailValueResult[0]
        );

        return groupDetailValueResult[0];
      } catch (err) {
        console.log("여기서 그룹 상세조회 에러 ::::", err);
        return err;
      }
    },
  },
};
