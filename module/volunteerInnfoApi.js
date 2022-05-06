const decodingKey = "elnY/olwGOrW1IdetzYnTg57rZ9hax/4cv+wXPk7uUjtqdXNiV7GD5AoPmem3oUzCSTvR0klktDmSF6KuIFJEg=="
const encodingKey = "elnY%2FolwGOrW1IdetzYnTg57rZ9hax%2F4cv%2BwXPk7uUjtqdXNiV7GD5AoPmem3oUzCSTvR0klktDmSF6KuIFJEg%3D%3D"
const axios = require("axios");
const pool = require("./mysql2");
const date = require("date-and-time");


// api 조회 후 db에 저장하기
const lookUpApi = async () => {

    try {

        // 우선 전체 개수를 알기 위한
        const totalCountApiAddress = await axios.get(`http://openapi.1365.go.kr/openapi/service/rest/VolunteerPartcptnService/getVltrPeriodSrvcList?serviceKey=${encodingKey}&progrmBgnde=20220101&progrmEndde=20221231&pageNo=1`);
        const totalCount = Math.floor(Number(totalCountApiAddress.data.response.body.totalCount) / Number(totalCountApiAddress.data.response.body.numOfRows)) + 1;

        // 7일을기준으로 나눈 불러올 페이지 수
        const numberRow = Math.floor(totalCount/7)

        // 요일별로 나눠서 수정 및 저장
        const date = new Date();
        // 오늘 요일 숫자로 나옴
        const today = date.getDay();

        // for 문 시작 
        // const startNumber = today !== 1 ? numberRow * today - numberRow + 1 : 1;
        // // for 문 종료
        // const endNumber = today !== 7 ?  numberRow * today : numberRow * today + 7

        // for 문 시작 
        const startNumber = 16;
        // for 문 종료
        const endNumber = 20;

        for(let d = startNumber; d <= endNumber; d++){
            // 숫자가 넘어가면 에러 처링

            // 기간별 전체 페이지 별 불러오기
            const resultApi = await axios.get(`http://openapi.1365.go.kr/openapi/service/rest/VolunteerPartcptnService/getVltrPeriodSrvcList?serviceKey=${encodingKey}&progrmBgnde=20220101&progrmEndde=20221231&pageNo=${d}`);
            const listDateData = await resultApi.data.response.body.items.item;

            // 데이터가  없다는것은 페이지가 초과했다는것 에러처리
            if(!listDateData){
                console.log("아무것도 들어온게 없습니다.!!!!!!", listDateData);
                return;
            }

            // 상세정보 조회를 위한 리스트 저장 배열
            let returnJson = [];

            // 등록번호로 상세정보 조회를 위한 배열 돌리기
            for(let n = 0; n<listDateData.length; n++){

                let progrmRegistNo = String(listDateData[n].progrmRegistNo);
    
                // 등록번호로 자세한 내용 가져오기     2826302
                const resultDetailInfo = await axios.get(`http://openapi.1365.go.kr/openapi/service/rest/VolunteerPartcptnService/getVltrPartcptnItem?serviceKey=${encodingKey}&progrmRegistNo=${progrmRegistNo}`);
                const detailData = await resultDetailInfo.data.response.body.items.item;

                console.log("봉사 상세 정보 조회 확인 ::::", detailData);
    
                // 청소년 가능
                detailData.teenPossible = detailData.yngbgsPosblAt === "N" ?  false : true;
                // 성인 가능
                detailData.adultPossible = detailData.adultPosblAt === "N" ?  false : true;
                // 그룹 가능
                detailData.groupPossible = detailData.grpPosblAt === "N" ?  false : true;



                // 자원봉사 설명중에 ' 스트링으로 변환과 겹쳐서 '를 "로 변환한다.
                detailData.progrmSj = detailData.progrmSj.replace(/'/g, '"');
                detailData.progrmCn = detailData.progrmCn.replace(/'/g, '"');

                // 시간 2글자로 저장
                detailData.actBeginTm = String(detailData.actBeginTm).length !== 2 ? "0" + String(detailData.actBeginTm) : String(detailData.actBeginTm);
                detailData.actEndTm = String(detailData.actEndTm).length !== 2 ? "0" + String(detailData.actEndTm) : String(detailData.actEndTm);
        

                console.log("가공 완료된 봉사 정보 확인 :::", detailData);
        
                //  자세한 정보 저장하기  
                const resultSaveDetailData = await modelLookUpApi(detailData);
    
                if(!resultSaveDetailData) {
                    // response.error(res, { errCode: 400, errMsg: 'THIRD_PARTY_ERROR', customErrorMsg: '다시 한번 시도해주세요' });
                    console.log("DB에 저장 에러입니다.", err);
                    return;
                }
    
                returnJson.push({
                    top : listDateData[n],
                    bottom : detailData
                });
            };

        }

        console.log("DB 저장 성공입니다.!!!!");
        return;


    } catch(err){
        console.log("api 조회 후 db에 저장 에러 :::", err);
    }
};


// api조회 후 db에 저장하기
const modelLookUpApi = async (obj) => {

    // 데이터베이스 테이블 컬럼 확인하기
    let queryArray = [
       "registNo", //  등록번호
       "progrmTitle", // 프로그램 이름
       "progrmBeginDate", // 시작 날짜
       "progrmEndDate", // 종료 날짜
       "actBeginTm", // 시작 시간
       "actEndTm", // 종료 시간
       "noticeBegin", // 모집시작일
       "noticeEnd", // 모집 종료일
       "recruitNunber", // 모집인원
       "srvcClcode", // 봉사분야
       "mnnstNm", // 모집기관(주관기관명)
       "postAdres", // 주소
       "adminName", // 관리자 이름
       "email", // 이메일
       "progrmExpl", // 프로그램 설명
       "telNo", // 전화번호
       "actWkdy", // 활동날짜 
       "teenPossible", // 청소년 가능
       "adultPossible", // 성인 가능
       "groupPossible", // 그룹가능
   ];

   let queryValue = [
       String(obj.progrmRegistNo),
       String(obj.progrmSj),
       String(obj.progrmBgnde),
       String(obj.progrmEndde),
       String(obj.actBeginTm),
       String(obj.actEndTm),
       String(obj.noticeBgnde),
       String(obj.noticeEndde),
       Number(obj.rcritNmpr),
       String(obj.srvcClCode),
       String(obj.mnnstNm),
       String(obj.postAdres),
       String(obj.nanmmbyNmAdmn),
       String(obj.email),
       String(obj.progrmCn),
       String(obj.telno),
       String(obj.actWkdy),
       Boolean(obj.teenPossible),
       Boolean(obj.adultPossible),
       Boolean(obj.groupPossible),
   ];

   // 테이블 컬럼 한줄로 만들기
   let strQuery = "";
   for(let q = 0; q < queryArray.length; q++){
       if(q === queryArray.length-1){
           strQuery += queryArray[q];
           break;
       }
       strQuery += queryArray[q] + ",";
   };

   // update를 위한 한줄로 쿼리 만들기
   let updateStrQuery = "";
   for (let u = 0; u < queryArray.length; u++){
       if ( queryArray[u] === "registNo" ) {
           continue;
       }
       if(u === queryArray.length-1){
           updateStrQuery += queryArray[u] + "=" + "'" +queryValue[u] + "'";
           break;
       }
       updateStrQuery += queryArray[u] + "=" + "'" +queryValue[u] + "'" + ",";
   }

   
   const sql = `insert into volunteerInfo (${strQuery} ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) on duplicate key update ${updateStrQuery}`;

//    console.log("마지막 확인 :::::", sql,"$$$$$$$$$$$$$$$",queryValue);
   return await pool.getData(sql, queryValue);
};

// 봉사 정보 저장 api
// lookUpApi();



const queryPar = {
    address : "양천구" , 
    dateSt : "20220401", 
    titleSt : "청소", 
    recruit : {
        teen : true, 
        adult : true, 
        group :false
    }
};

// 봉사 리스트 반환하기 + 검색
const infoLookUp = async ( queryPar ) => {

    // 시작 날짜로 검색
    const progrmBeginDate = queryPar.dateSt ? queryPar.dateSt : "";
    // 주소 검색
    const postAdres = queryPar.address ? `%${queryPar.address}%` : "";
    // 프로그램 이름 검색 
    const progrmTitle = queryPar.dateSt ? queryPar.dateSt : "";
    // 청소년 가능?
    const teenPossible = queryPar.dateSt ? queryPar.dateSt : "";
    // 성인 가능?
    const adultPossible = queryPar.dateSt ? queryPar.dateSt : "";
    // 그룹 가능
    const groupPossible = queryPar.dateSt ? queryPar.dateSt : "";

    // 검색어를 위한
    // const sql = "select * from volunteerInfo where progrmBeginDate >= ? and progrmEndDate <= ? and postAdres like ? limit ? , 5;";

    const sql = "select * from volunteerInfo where teenPossible = ? and adultPossible = ? and groupPossible = ? limit 0 , 5;";

    // let queryValue = [
    //     req.params.startDate,
    //     req.params.endDate,
    //     req.params.area,
    //     req.params.pageNumber
    // ];

    let queryValue = [
        // false,
        // true,
        // false, // 안되면 true, false 글자로 저장해서 불러오는 방ㅂ버이 있긴한데 
        "",//  방법이 생각이 났다 검색 한다고 값이 들어왔을 경우에만 쿼리에 포함시키는 거다 
        "", // 이것이 가장 간단하고 확실한 방법이다. 이부분만 완료되면 거의 다 완성되었다고 볼 수 있다.
        "" // 그러면 graphl api만 작성해주고 트랠로에 올리며 끝
    ];

    const result = await pool.getData(sql, queryValue);
    console.log("검색 결과 확인 :::", result);

};

// infoLookUp();


const day = date.format(new Date(), 'YYYYMMDD');
console.log("오늘 날짜 기준 ::::", day,day.length);







// 봉사 리스트 전체 개수 반환
const infoCount = async ( req, res ) => {

    const sql = "select count (*) as count from volunteerInfo where progrmBeginDate >= ? and progrmEndDate <= ? and postAdres like ?;";

    let queryValue = [
        req.params.startDate,
        req.params.endDate,
        req.params.area,
        req.params.pageNumber
    ];

    return await pool.getData(sql, queryValue);
};



module.exports = {
    lookUpApi
}