const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const { argv } = require("yargs");
const cron = require("node-cron");
const dateTime = require("date-and-time");
const { bodyParserGraphQL } = require("body-parser-graphql");
const { ApolloServer, gql } = require("apollo-server-express");
const { execute, subscribe } = require("graphql");
const schema = require("./schema");
const errList = require("./module/errorList");
const auth = require("./module/auth");
const { ApolloError } = require("apollo-server-errors");
const expressPlayground =
  require("graphql-playground-middleware-express").default;

const app = express();

const port = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
// app.use(`${config.server.context_path}`, router);

app.set("view engine", "html");

const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  introspection: true,
  context: async ({ req }) => {
    if (req.headers.token) {
      const result = auth.authToken.get(req.headers.token);
      // if (!result) {
      //   throw new ApolloError("10006", "10006");
      // }
      return {
        token: req.headers.token,
        data: result,
      };
    }
    return false;
  },
  formatError: (err) => {
    if (err.path) {
      if (!Number(err.message)) {
        return {
          code: "10003",
          message: errList["10003"].knMessage,
        };
      }
      return {
        code: String(err.extensions.code),
        message: errList[String(err.extensions.code)].knMessage,
      };
    }
    // 정의되지 않은 에러
    return {
      code: String(err.extensions.code),
      message: errList[String(err.extensions.code)].knMessage,
    };
  },
});

app.get("/", (req, res) => {
  console.log("여기서 req 확인을 위한 :::", req);
  res.send("5002포트로 들어왔습니다.");
});
// express에서 플레이그라운드를 사용하기 위한
app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

//node ==> deploy.js --mode=dev
//pm2  ==> pm2 start deploy.js --node-args="deploy.js --mode=dev" --name=mobile_api

// app.set("jwt-secret", config.jwt_secret);
app.set("jwt-secret", "jwt");

if (argv.mode === "dev") {
  process.env.NODE_ENV = "development";
} else if (argv.mode === "prod") {
  process.env.NODE_ENV = "production";
} else {
  process.env.NODE_ENV = "development";
}

// 차례차례로 돌아가야한다고 함
server.start().then((res) => {
  server.applyMiddleware({ app, path: "/graphql" });
  app.listen(5002, () => {
    console.log(
      `포트번호 ${port}로 돌아가고 현재 ${process.env.NODE_ENV} 버전입니다.`
    );
  });
});
