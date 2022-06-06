//에러코드 추가,
module.exports = {
  10001: {
    enMessage: "NOT_LOGIN",
    knMessage: "로그인이 되지 않았다.",
  },
  10002: {
    enMessage: "AUTH_TOKEN_FAIL",
    knMessage: "인증키가 없거나 유효하지 않습니다.",
  },
  10003: {
    enMessage: "BAD_REQUEST",
    knMessage: "잘못된 요청입니다.",
  },
  10004: {
    enMessage: "PHONE_ALREADY_EXIST",
    knMessage: "이미 가입된 휴대전화 번호 입니다.",
  },
  10005: {
    enMessage: "NOT_AVABILY",
    knMessage: "유효한값이 아닙니다.",
  },
  10006: {
    enMessage: "SMS_CERT_FAIL",
    knMessage: "인증에 실패하였습니다",
  },
  10007: {
    enMessage: "INTERNAL_SERVER_ERROR",
    knMessage: "서버에서 에러가 발생하였습니다.",
  },
  10008: {
    enMessage: "DATA_FORMAT_ERROR",
    knMessage: "데이터 형식이 잘못되었습니다.",
  },
  10016: {
    enMessage: "IS_NOT_MEMBERS",
    knMessage: "로그인 후 이용해주시기 바랍니다.",
  },
  msgFun: function (errCode, customMessage) {
    if (errCode === "33333") {
      return customMessage;
    }

    return "커스텀 에러를 반환";
  },
};
