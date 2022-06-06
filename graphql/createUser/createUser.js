const { ApolloError } = require("apollo-server-errors");
const crypto = require("crypto");
const pool = require("../../module/mysql2");

// 회원가입 쿼리
module.exports = {
  Mutation: {
    createUser: async (_, info) => {
      try {
        // 받아온 정보가 부족할 때
        if (!info.id || !info.userName || !info.phone) {
          throw new ApolloError("10005");
        }

        gender = String(info.gender);
        // 성별 검사 - 에러처리
        if (!gender === "false" || !gender === "true") {
          throw new ApolloError("10005");
        } else {
          gender = Boolean(info.gender);
        }

        // 비밀번호 변경
        password = info.password
          ? crypto.createHash("sha512").update(info.password).digest("base64")
          : "";

        // 생년월일
        birthday = info.birthday ? String(info.birthday) : "null";
        if (birthday !== "null" || birthday.length !== 8) {
          throw new ApolloError("10005");
        }

        // 주소를 분할을 해야한디 - 수정 - 한형님과의 논의
        address = info.address ? info.address : "null";

        // 회원 정보 저장
        const sql = `insert into users ( birthday, gender, phoneNumber, userName, userId, password ) values (?, ?, ?, ?, ?, ?) ;`;
        let queryValue = [
          birthday,
          gender,
          info.phone,
          info.userName,
          info.id,
          password,
        ];
        const resultData = await pool.getData(sql, queryValue);
        console.log("회원가입 결과 확인 :::", resultData);

        return true;
      } catch (err) {
        console.log("회원가입 에러 :::", err);
        throw new ApolloError(err["message"], err["message"]);
      }
    },
  },
};
