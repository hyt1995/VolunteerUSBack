const { ApolloError } = require("apollo-server-errors");
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");
const errorList = require("../../module/errorList");

module.exports = {
  Mutation: {
    kakaoUserInfoLogin: async (_, info) => {
      try {
        // id가 안들어왔을 경우
        if (!info.token) {
          throw new ApolloError("10005");
        }

        const kakaRestId = "e98a98f979b43a08c0756c1590d4f028";

        // 받아온 토큰 확인 하기 위한 절차
        const postAxios = await axios.post(
          `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${kakaRestId}&redirect_uri=http://localhost:3000/kakao/user&code=${info.token}&client_secret=Y7ZRniW3iS1rpiOjmTl1fWkyJgn5Cg1h`,
          {
            headers: {
              "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
            },
          }
        );

        const emailcode = postAxios.data.access_token;

        const resultLookUp = await axios.get(
          "https://kapi.kakao.com/v2/user/me",
          {
            headers: {
              Authorization: `Bearer ${emailcode}`,
              "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
            },
          }
        );

        const kakaotalkEmail = await resultLookUp.data.kakao_account.email;
        const kakaotalkname = await resultLookUp.data.kakao_account.profile
          .nickname;
        const kakaoGender =
          (await resultLookUp.data.kakao_account.gender) === "male"
            ? true
            : false;

        // 카카오 로그인으로 정보가 있는지 없는지 확인 절차
        const sql = `SELECT id, userName FROM users WHERE userId = ?;`;
        let queryValue = [kakaotalkEmail];
        const userId = await pool.getData(sql, queryValue);

        // 기존의 아이디가 없으면 회원가입 페이지로 이동, 받아온 정보 그대로 보내주기
        if (!userId[0][0]) {
          return {
            id: kakaotalkEmail || "",
            name: kakaotalkname || "",
            address: "",
            gender: kakaoGender || false, // 남자 true, 여자 false
            birthday: "",
            phone: "",
            token: "",
          };
        }

        // 정보가 있을 경우 토큰을 보내준다.

        let authToken = auth.authToken.member.set({
          weatherMerber: true,
          userNum: userId[0][0].id,
          userName: userId[0][0].userName,
          loginId: kakaotalkEmail,
        });

        return {
          id: kakaotalkEmail || "",
          name: kakaotalkname || "",
          address: "",
          gender: kakaoGender || false, // 남자 true, 여자 false
          birthday: "",
          phone: "",
          token: authToken || "",
        };
      } catch (err) {
        console.log("카카오로그인 에러 ::::", err);
        throw new ApolloError(err["message"], err["message"]);
      }
    },
  },
};
