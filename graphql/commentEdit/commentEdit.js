const { ApolloError } = require("apollo-server-errors");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");

module.exports = {
  Mutation: {
    commentEdit: async (_, info, context) => {
      try {
        if (!info.commentText) {
          // 여기서 코멘트 삭제
          const deleteSql = `delete from comment where id = ?;`;

          const deleteQueryValue = [info.commentID];

          const deleteResult = await pool.getData(deleteSql, deleteQueryValue);

          console.log("코멘트 삭제 확인 ::: ", deleteResult);

          return true;
        }
        // 코멘트 수정
        const updateSql = `update comment set commentText = ?, createdAtComText = ? where id = ?;`;

        const date = new Date();

        const updateQueryValue = [info.commentText, date, info.commentID];

        const updateResult = await pool.getData(updateSql, updateQueryValue);

        console.log("코멘트 수정 확인  :::", updateResult);
        return true;
      } catch (err) {
        console.log("코멘트 수정 삭제 에러 :::", err);
        throw new ApolloError(err["message"], err["message"]);
      }
    },
  },
};
