const { ApolloError } = require('apollo-server-errors');
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");

module.exports = {
    Query : {
        login : async ( _ ,{id, password} ) => {

            console.log("로그인 들어온 정보 :::",_ ,id ,password)

            try {


                // 아이디 비밀번호가 없을 경우 
                if ( !id || !password){
                    throw new ApolloError("정보를 다시 확인해주세요", "이상한 아이디", {
                        message: "id",
                      });
                };

                // 비밀번호 변경
                transPassword = crypto.createHash('sha512').update(password).digest('base64');

                // 아이디 비번일 맞을 경우
                const sql = `SELECT id FROM users WHERE userId = ? AND password= ?;`;

                let queryValue = [
                    id,
                    transPassword
                    // password
                ];

                const resultLogin = await pool.getData(sql, queryValue);

                if(!resultLogin[0][0]){
                    throw new ApolloError("아이디가 존재하지 않습니다.", "이상한 아이디", {
                        message: "id",
                      });
                };

                let authToken = auth.authToken.member.set({
                    weatherMerber : true,
                    userNum : resultLogin[0][0].id,
                    loginId : id
                });
                
                return authToken;

            } catch( err ) {
                console.log("여기서 에러 발생");
                return err;
            }
        }
    }
}