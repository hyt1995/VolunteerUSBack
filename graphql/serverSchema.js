const { buildSchema, graphql } = require("graphql");
const userData = require("../users.json");
const pool = require("../module/mysql2");
const auth = require("../module/auth");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");



const schema = buildSchema(`

    type User {
        id : String
        name : String
        address : String
        gender : Boolean
        birthday : String
        phone : String
        token : String
    }

    type Query {
        login(id:String! password:String!) : String!
        confirmUserId( id : String! ) : Boolean!
    }

    type Mutation {
        createUser ( 
            id : String! 
            userName : String!
            password : String! 
            gender : Boolean
            birthday : String
            phone : String!
            address : String
        ) : Boolean!

        kakaoUserInfoLogin(
            id : String! 
            name : String
            address : String
            gender : Boolean
            birthday : String
            phone : String
        ) : User
    }

`);



const root = {

    // 똑같은 아이디가 존재하는지 검사를 위해
    confirmUserId :  async ( { id } ) => {

        try {

            console.log("넘어온 아이디 확인 :::", id);

            // 아이디가 넘어 오지 않았을 경우
            if( !id ){
                return false
            }

            // 아이디 검사
            const sql = `SELECT id FROM users WHERE userId = ?;`;
            let queryValue = [
                id
            ];
            const resultData =  await pool.getData(sql, queryValue);
            console.log("아이디 조회 결과 :::", resultData);

            // 아이디가 없는 경우
            if(!resultData[0][0]){
                return true;
            }
            //  아이디가 있는 경우
            return false;

        } catch ( err ) {
            console.log("로그인 아이디 확인 에러 ::::", err);
            return false;
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

    // 회원가입을 위한 
    createUser : async ( info) => {

        try {

            console.log("받아온 회원가입 정보 ::", info);

            // 받아온 정보가 부족할 때 
            if ( !info.id || !info.userName || !info.password || !info.phone ) {

                console.log("받아온 정보 부족 :::", info);
                return false;
            };

            gender = String(info.gender);
            // 성별 검사
            if(!gender === "false" || !gender === "true"){
                return false;
            } else {
                gender = Boolean(info.gender);
            };

            // 비밀번호 변경
            password = crypto.createHash('sha512').update(info.password).digest('base64');

            // 생년월일
            birthday = info.birthday ? String(info.birthday) : "null";

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
            const resultData =  await pool.getData(sql, queryValue);

            console.log("정보 저장 결과확인 :::", resultData);

            return true;

        } catch ( err ) {
            console.log("회원가입 에러 :::", err);
            return false;
        }

        // fs.readFile("data.json", "utf-8", (err, fileContent) => {

        //     let userInfoData = [];
            
        //     if(!err){
        //         userInfoData = JSON.parse(fileContent);
        //     }

        //     userInfoData.push({
        //         "userId" : userInfoData.length + 1,
        //         "id" : id,
        //         "password" : crypto.createHash('sha512').update(password).digest('base64'),
        //         // "password" : password,
        //         "address" : address,
        //         "gender" : gender,
        //         "age" : age,
        //         "phone" : phone
        //     });
        
        //     fs.writeFile("data.json", JSON.stringify(userInfoData), "utf-8", function (err) {
        //         console.log("파일 쓰기 에러 ::::", err);
        //     })
        // })
    },

    // 로그인을 위한 함수
    login : async ( { id, password }) => {

        try {

            console.log("로그인을 위한 정보 확인 ::::",  id, password );

            // 아이디 비밀번호가 없을 경우 
            if ( !id || !password){
                return "false";
            }

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

            console.log("로그인 결과 확인 :::", resultLogin[0][0]);

            if(!resultLogin[0][0]){
                return "아이디가 없습니다.";
            }

            
            let authToken = auth.authToken.member.set({
                weatherMerber : true,
                userNum : resultLogin[0][0].id,
                loginId : id
            });
            
            return authToken;

        } catch ( err ) {
            console.log("로그인 에러 :::", err);
            return "false";
        };

        // const sql = `SELECT id FROM users WHERE userId = ? AND password= ?;`;

        // let queryValue = [
        //     id,
        //     password
        // ];

        // const userId = await pool.getData(sql, queryValue);

        // let data = fs.readFileSync("data.json");
        // let retData = JSON.parse(data);

        // if(retData.length === 0){
        //     return "아무 유저 정보가 없습니다."
        // } 

        // let findId = retData.find(i => {
        //     return i.id === id
        // })

        // const transPassword = crypto.createHash('sha512').update(password).digest('base64')

        // if(!findId || transPassword !== findId.password) return "일치하는 정보가 없습니다."
    },
    // 카카오 로그인 관련
    kakaoUserInfoLogin : async ( info ) => {

        try {

            console.log(" 들어온 정보 확인 차 :::: ", info );

            // id가 안들어왔을 경우
            if ( !info.id ) {
                return {
                    id : "", 
                    name : "",
                    address : "",
                    gender : false, 
                    birthday : "", 
                    phone : "",
                    token : "",
                };
            }

            // 카카오 로그인으로 정보가 있는지 없는지 확인 절차
            const sql = `SELECT id FROM users WHERE userId = ?;`;
            let queryValue = [
                info.id
            ];
            const userId = await pool.getData(sql, queryValue);

            console.log("mysql 결과 확인 ::::", userId[0][0]);

            // 기존의 아이디가 없으면 회원가입 페이지로 이동, 받아온 정보 그대로 보내주기
            if(!userId[0][0]){

                return {
                    id : info.id || "", 
                    name : info.name || "",
                    address : info.address || "",
                    gender : info.gender || false,  // 남자 true, 여자 false
                    birthday : info.birthday || "", 
                    phone : info.phone || "",
                    token : "",
                };

            }

            // 정보가 있을 경우 토큰을 보내준다.

            let authToken = auth.authToken.member.set({
                weatherMerber : true,
                userNum : userId[0][0].id,
                loginId : info.id
            });

            return {
                id : info.id || "", 
                name : info.name || "",
                address : info.address || "",
                gender : info.gender || false, // 남자 true, 여자 false
                birthday : info.birthday || "", 
                phone : info.phone || "",
                token : authToken || "",
            };

        } catch ( err ) {
            console.log("카카오로그인 에러 ::::", err);
        }
    },
}

module.exports = {
    schema,
    root
};




// https://hwasurr.io/api/graphql-example/
// https://www.daleseo.com/graphql-apollo-server-auth/

// https://www.inflearn.com/course/%EC%96%84%ED%8C%8D%ED%95%9C-graphql-apollo#reviews

// https://github.com/bitfumes/graphql-course

// https://koras02.tistory.com/118

// https://devport.tistory.com/4