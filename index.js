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
    return req.headers;
  },
  formatError: (err) => {
    // 에러가 날경우 에러를 리턴 타입과 다르게 보내기 위해 에러 형식을 지정하는 곳입니다.
    // Don't give the specific errors to the client.
    if (err.message.startsWith("Database Error: ")) {
      return new Error("Internal server error");
    }
    return err;
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
