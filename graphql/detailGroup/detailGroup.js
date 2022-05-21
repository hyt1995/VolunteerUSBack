const { ApolloError } = require("apollo-server-errors");
const pool = require("../../module/mysql2");
const errorList = require("../../module/errorList");

// 그룹상세조회 페이지
module.exports = {
  Query: {
    detailGroup: async (_, info) => {
      try {
        // 그룹 이름이 안들어왔을 경우
        if (!info.groupId) {
          return errorList.returnError("정보를 다시 확인해주세요", 403);
        }

        // 그룹에 대한 자세한 설명과 그 그룹 소속 유저들 생년월일과 성별을 불러온다.
        const groupDetailSql = `select * from groupInfo left join groupApply on applyGroupId = ? left join users on users.id = applyUserId where groupInfo.id = ?`;

        let groupDetailValue = [info.groupId, info.groupId];

        let groupDetailValueResult = await pool.getData(
          groupDetailSql,
          groupDetailValue
        );

        // 생년월일이 없을경우 나이는 0으로 표시
        let context = await groupDetailValueResult[0].map((i) => {
          if (i.birthday === "null") {
            i.countAge = 0;
            return i;
          }

          if (i.birthday) {
            // 생년월일로 나이를 계산하는 것들
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
          }
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
