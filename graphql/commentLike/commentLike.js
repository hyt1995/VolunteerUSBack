const { ApolloError } = require("apollo-server-errors");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");
const errorList = require("../../module/errorList");

module.exports = {
  Mutation: {
    commentLike: async (_, info, context) => {
      try {
        // info.active true 일 경우 댓글 좋아요
        if (info.active) {
          const sql = `insert into commentLike (likeUserId, commentID, createdAt) values (?, ?, ?);`;

          const date = new Date();

          const queryValue = [context.data.userNum, info.commentId, date];

          const result = await pool.getData(sql, queryValue);
          console.log("좋아요 테이블에 저장 결과확인 :::", result);

          return true;
        }
        // info.active false일 경우
        const deleteSql = `delete from commentLike where commentID = ?;`;

        const deleteQueryValue = [info.commentId];

        const deleteResult = await pool.getData(deleteSql, deleteQueryValue);

        console.log("좋아요 테이블에 저장 결과확인 :::", deleteResult);

        return true;
      } catch (err) {
        console.log("댓글 좋아요 에러:::", err);
        throw new ApolloError(err["message"], err["message"]);
      }
    },
  },
};
