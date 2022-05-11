const { ApolloError } = require('apollo-server-errors');
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");

module.exports = {
    Query : {
        loginTokenAuth : async ( _, info, context ) => {

            try {
    
                console.log("토큰 들어온ㄱ밧 :::", _,info)
    
                // console.log("들어온 토큰 확인 :::", context);
                // context를 통해 auth에 req.user를 담아서 가져온다. 
                // req.user가 없으면 접근 불가 처리를 하고 
                // req.user에 있는 정보로 DB 조회 하고
                // req.user에 user이름을 추가를 해야한다.
                // 그래서 프론트에 DB조회를 하지않고 바로 보낼수 있게
    
                const user = auth.authToken.get(info.token);
    
                if(user === false){
    
                    throw new ApolloError("다시 로그인해주세요", "이상한 아이디", {
                        message: "id",
                      });
                }
    
                console.log("변환된 토큰 확인 :::", user);
    
                return "토큰 성공적 변환 완료 !!!!";
    
            } catch ( err ) {
                console.log("토큰 로그인 에러 ::::", err);
                return err;
            }
        }
    }
}