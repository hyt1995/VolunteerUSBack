const { ApolloError } = require("apollo-server-errors");
const pool = require("../../module/mysql2");

module.exports = {
  Query: {
    detailInfo: async (_, info) => {
      try {
        // 봉사 등록번호가 안들어옴
        if (!info.registNo) {
          throw new ApolloError("10005");
        }

        const pageNum = info.pageNum ? (Number(info.pageNum) - 1) * 10 : 0;

        // // 봉사 상세 유저를 위한
        // const sql = `select * from volunteerInfo left join applyVolunteerInfo on registNoApply = ? left join users on users.id = userIdApply where registNo = ?;`;

        // const queryValue = [info.registNo, info.registNo];

        // const result = await pool.getData(sql, queryValue);
        // console.log("봉사 상세 조회 값 확인 :::", result[0]);

        // // 신청한 유저 정보 통계를 위한
        // const applyUserInfo = await result[0].map((i) => {
        //   if (i.birthday === "null") {
        //     i.countAge = 0;
        //   } else {
        //     if (i.birthday !== "null" || i.birthday.length !== 8) {
        //       i.birthday = "19" + i.birthday;
        //     }
        //     let date = new Date();
        //     let year = date.getFullYear();
        //     let month = date.getMonth() + 1;
        //     let day = date.getDate();
        //     if (month < 10) month = "0" + month;
        //     if (day < 10) day = "0" + day;
        //     let monthDay = month + day;
        //     birth = i.birthday.replace("-", "").replace("-", "");
        //     let birthdayy = birth.substr(0, 4);
        //     let birthdaymd = birth.substr(4, 4);
        //     let age =
        //       monthDay < birthdaymd ? year - birthdayy - 1 : year - birthdayy;
        //     i.countAge = age;
        //   }
        //   return {
        //     gender: i.gender,
        //     age: i.countAge,
        //   };
        // });

        // 봉사 상세 페이지 커멘트를 위한   COUNT(name)
        // const commentSql = `select groupName, commentText,createdAtComText, userName, comment.id from volunteerInfo left join comment on agencyId = mnnstNmId left join users on writeUserId = users.id left join groupApply on groupApply.applyUserId = writeUserId left join groupInfo on groupInfo.id = applyGroupId where registNo = ?;`;

        const commentSql = `select mnnstNmId, commentText, createdAtComText, userName, applyUserId, applyGroupId from volunteerInfo
           left join comment on agencyId = mnnstNmId 
           left join users on users.id = writeUserId 
           left join (select * from groupApply) groupApply on applyUserId = writeUserId
           where registNo = ?;`;
        const commentValue = [
          info.registNo,
          // pageNum   limit ? , 10x
        ];

        const commentResult = await pool.getData(commentSql, commentValue);
        console.log("봉사 상세 comment!!! :::", commentResult[0]);

        // const commentResultValue = await commentResult[0].map((i) => {
        //   if (i.id) return i;
        // });

        // console.log("코멘트 관련 부분확인을 위한 :::", commentResultValue);

        // 코멘트 정보 리스트를 위한

        // const returnValueList = {
        //   registNo: result[0][0].registNo,
        //   progrmTitle: result[0][0].progrmTitle,
        //   progrmBeginDate: result[0][0].progrmBeginDate,
        //   progrmEndDate: result[0][0].progrmEndDate,
        //   actBeginTm: result[0][0].actBeginTm,
        //   recruitNunber: result[0][0].recruitNunber,
        //   srvcClcode: result[0][0].srvcClcode,
        //   postAdres: result[0][0].postAdres,
        //   adminName: result[0][0].adminName,
        //   email: result[0][0].email,
        //   progrmExpl: result[0][0].progrmExpl,
        //   telNo: result[0][0].telNo,
        //   noticeBegin: result[0][0].noticeBegin,
        //   noticeEnd: result[0][0].noticeEnd,
        //   teenPossible: result[0][0].teenPossible,
        //   adultPossible: result[0][0].adultPossible,
        //   groupPossible: result[0][0].groupPossible,
        //   registNoApply: result[0][0].registNoApply,
        //   applyUserInfo: applyUserInfo,
        //   commentResult: commentResultValue,
        // };
        // console.log("마지막 리턴 값 객체 :::######", returnValueList);

        return true;
      } catch (err) {
        console.log("봉사 상세 페이지 에러:::", err);
        throw new ApolloError(err["message"], err["message"]);
      }
    },
  },
};
