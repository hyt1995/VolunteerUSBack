const { ApolloError } = require("apollo-server-errors");
const pool = require("../../module/mysql2");
const errorList = require("../../module/errorList");

module.exports = {
  Query: {
    confirmUserId: async (_, { id }) => {
      try {
        // 아이디가 넘어 오지 않았을 경우
        if (!id) {
          return errorList.returnError("정보를 다시 확인해주세요", 400);
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
        return err;
      }

      // let data = fs.readFileSync("data.json");
      // let retData = JSON.parse(data);

      // if(retData.length === 0){
      //     return true;
      // }else {
      //     let findId = retData.find(i =>  {
      //         return i.id === id
      //     });
      //     if(findId) return true;
      //     return false;
      // }
    },
  },
};
