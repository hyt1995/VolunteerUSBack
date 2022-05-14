const { ApolloError } = require('apollo-server-errors');
const crypto = require("crypto");
const auth = require("../../module/auth");
const pool = require("../../module/mysql2");


module.exports = {
    Mutation : {
        createUser : async ( _, info) => {

            try {
    
                // 받아온 정보가 부족할 때 
                if ( !info.id || !info.userName || !info.phone ) {
    
                    console.log("받아온 정보 부족 :::", info);
                    throw new ApolloError("정보를 다시 확인해주세요", "이상한 아이디", {
                        message: "id",
                      });
                };
    
                gender = String(info.gender);
                // 성별 검사
                if(!gender === "false" || !gender === "true"){
                    return false;
                } else {
                    gender = Boolean(info.gender);
                };
    
                // 비밀번호 변경
                password = info.password ? crypto.createHash('sha512').update(info.password).digest('base64') : "";
    
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
        } 
    }
}