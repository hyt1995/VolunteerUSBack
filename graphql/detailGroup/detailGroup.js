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

        // 그룹에 대한 자세한 설명과 그 그룹 소속 유저들 생년월일과 성별을 불러온다.
        const groupDetailSql = `select * from groupInfo left join groupApply on applyGroupId = ? left join users on users.id = applyUserId where groupInfo.id = ?`;

        let groupDetailValue = [info.groupId, info.groupId];

        let groupDetailValueResult = await pool.getData(
          groupDetailSql,
          groupDetailValue
        );

        let context = await groupDetailValueResult[0].map((i) => {
          if (i.birthday === "null") {
            console.log("값이 아닐 경우 :::", i.birthday);
            i.countAge = 0;
            return i;
          }

          let date = new Date();
          let year = date.getFullYear();
          let month = date.getMonth() + 1;
          let day = date.getDate();
          if (month < 10) month = "0" + month;
          if (day < 10) day = "0" + day;
          let monthDay = month + day;
          birth = i.birthday.replace("-", "").replace("-", "");
          let birthdayy = birth.substr(0, 4);
          let birthdaymd = birth.substr(4, 4);
          let age =
            monthDay < birthdaymd ? year - birthdayy - 1 : year - birthdayy;
          i.countAge = age;

          return i;
        });

        return context;
      } catch (err) {
        console.log("여기서 그룹 상세조회 에러 ::::", err);
        return err;
      }
    },
  },
};
