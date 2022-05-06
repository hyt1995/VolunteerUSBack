const { buildSchema, graphql } = require("graphql");
const userData = require("../users.json");
const pool = require("../module/mysql2");
const auth = require("../module/auth");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const date = require("date-and-time");
const { default: axios } = require("axios");



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

    type InfoVolunteer {
        registNo : String
        progrmTitle : String
        progrmBeginDate : String
        progrmEndDate : String
        actBeginTm : String
        actEndTm : String
        recruitNunber : Int
        srvcClcode : String
        mnnstNm : String
        postAdres : String
        adminName : String
        email : String
        progrmExpl : String
        telNo : String
        actWkdy : String
        noticeBegin : String
        noticeEnd : String
        teenPossible : Int
        adultPossible : Int
        groupPossible : Int
    }

    type Query {
        login(id:String! password:String!) : String!
        confirmUserId( id : String! ) : Boolean!
        infoListResponse(
            progrmBeginDate : String
            postAdres : String
            progrmTitle : String
            teenPossible : String
            adultPossible : String
            groupPossible : String
            pageNumber : Int
        ) : [InfoVolunteer]
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
            token : String!
        ) : User
    }

`);



const root = {

    // 똑같은 아이디가 존재하는지 검사를 위해
    confirmUserId :  async ( { id } ) => {

        try {

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


    // 봉사 정보 리스트 반환
    infoListResponse : async ( info ) => {

        try {

            // 쿼리 부분
            let whereQuery = "";

            // 값이 있으면 쿼리에 추가된다.
            const queryString = ["postAdres", "progrmTitle", "teenPossible", "adultPossible", "groupPossible"];

            // 시작 날짜가 들어오지 않으면 오늘 날짜를 넣어준다.
            if( !info.progrmBeginDate ) {
                const day = date.format(new Date(), 'YYYYMMDD');
                whereQuery  = `progrmBeginDate >= ${day}`;
            } else {
                // 20220507 형식이 아닐경우 빈배열을 보내준다.
                if(!info.progrmBeginDate.length === 8){
                    return [];
                }
                // 들어온값을 넣어준다.
                whereQuery  = `progrmBeginDate >= ${info.progrmBeginDate}`;
            }

            // 검색 값이 들어올경우에만 쿼리에 추가한다.
            for (let n = 0; n < queryString.length; n++){

                const arrayValue = queryString[n];

                // 검색 값이 들어오면 쿼리에 추가해준다.
                if ( arrayValue === "postAdres" && info[arrayValue] ){
                    whereQuery += ` and postAdres like "%${info[arrayValue]}%"`;
                } 
                // 봉사 제목으로 검색값이 들어왔을 경우
                else if (arrayValue === "progrmTitle" && info[arrayValue]) {
                    whereQuery += ` and progrmTitle like "%${info[arrayValue]}%"`;
                }
                // 나머지 모집 대상값이 들어왔을 경우
                else if (info[arrayValue]) {
                    whereQuery += ` and ${arrayValue} = ${info[arrayValue]}`;
                }
            };

            pageNumberQuery = info.pageNumber ? (Number(info.pageNumber) -1) * 3 : 0;


            // DB 에서 데이터 불러와서 반환해주기 쿼리
            const sql = `select * from volunteerInfo where ${whereQuery} limit ? , 3;`;

            let queryValue = [
                pageNumberQuery
            ];

            console.log("마지막으로 확인 ::::", sql, queryValue);

            const result = await pool.getData(sql, queryValue);

            console.log("결과값도 같이 ::::", result[0]);
            return result[0];


        } catch ( err ){
            console.log("여기서 에러 발생 :::", err);
            return [];
        };

    },



    // 카카오 로그인 관련
    kakaoUserInfoLogin : async ( info ) => {

        try {

            // id가 안들어왔을 경우
            if ( !info.token ) {
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


            const resultLookUp = await axios.get('https://kapi.kakao.com/v2/user/me',{
                headers: {
                    Authorization: `Bearer ${info.token}`,
                    "Content-type" : "application/x-www-form-urlencoded;charset=utf-8"
                }
            });

            console.log("여기서 토큰 확인 ::::", resultLookUp);

            const kakaotalkEmail = await resultLookUp.data.kakao_account.email;
            const kakaotalkname = await resultLookUp.data.kakao_account.profile.nickname;
            const kakaoGender = await resultLookUp.data.kakao_account.gender === "male" ? true : false ;


            // 카카오 로그인으로 정보가 있는지 없는지 확인 절차
            const sql = `SELECT id FROM users WHERE userId = ?;`;
            let queryValue = [
                kakaotalkEmail
            ];
            const userId = await pool.getData(sql, queryValue);

            console.log("mysql 결과 확인 ::::", userId[0][0]);

            // 기존의 아이디가 없으면 회원가입 페이지로 이동, 받아온 정보 그대로 보내주기
            if(!userId[0][0]){

                return {
                    id : kakaotalkEmail || "", 
                    name : kakaotalkname || "",
                    address : "",
                    gender : kakaoGender || false,  // 남자 true, 여자 false
                    birthday : "", 
                    phone : "",
                    token : "",
                };

            }

            // 정보가 있을 경우 토큰을 보내준다.

            let authToken = auth.authToken.member.set({
                weatherMerber : true,
                userNum : userId[0][0].id,
                loginId : kakaotalkEmail
            });

            return {
                id : kakaotalkEmail || "", 
                name : kakaotalkname || "",
                address :  "",
                gender : kakaoGender || false, // 남자 true, 여자 false
                birthday : "", 
                phone : "",
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