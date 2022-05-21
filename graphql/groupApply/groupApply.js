const { ApolloError } = require("apollo-server-errors");
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");
const errorList = require("../../module/errorList");

// 그룹 신청 페이지 - 대표자 이름으로 조회에서 대표자 아이디도 같이 넣어야함
// 그룹이름 겹치지 않게 그룹이름 조회하는 기능도 넣어야함
module.exports = {
  Mutation: {
    groupApply: async (_, info, context) => {
      try {
        // 정보가 없으면 에러 반환
        if (
          (!info.groupName,
          !info.limit,
          !info.groupGreeting,
          !info.groupExplane)
        ) {
          return errorList.returnError("정보를 다시 확인해주세요", 400);
        }

        // 로그인한 사용자 정보 확인
        const user = auth.authToken.get(context.token);
        if (user === false) {
          return errorList.returnError("유효한 토큰이 아닙니다.", 403);
        }

        // 그룹이름 조회하는 페이지
        const groupNameLookUpSql = `select id from groupInfo where groupName = ?`;

        let groupNameLookUpValue = [info.groupName];

        const groupNameLookUpResult = await pool.getData(
          groupNameLookUpSql,
          groupNameLookUpValue
        );

        // 이름이 있을 경우 신청 불가를 알린다.
        if (groupNameLookUpResult[0].length !== 0) {
          return errorList.returnError("그룹명이 이미 있습니다.", 400);
        }

        // 이름이 없으므로 신청이 가능
        // DB에 데이터 저장
        const sql = `insert into groupInfo (groupName, representName, limitPeople, groupGreeting, groupExplain, userId, addressGroupInfo, openChatUrl) values (?, ?, ?, ?, ?, ?, ?, ? ) `;

        let queryValue = [
          info.groupName,
          user.userName,
          info.limit,
          info.groupGreeting,
          info.groupExplane,
          user.userNum,
          info.AddressGroup,
          info.openChatUrl,
        ];

        const result = await pool.getData(sql, queryValue);

        console.log("그룹 저장 결과 확인 :::", result);

        return true;
      } catch (err) {
        console.log("그룹신청 에러 :::", err);
        return errorList.returnError("서버 에러", 500);
      }
    },
  },
};
