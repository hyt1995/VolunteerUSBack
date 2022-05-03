const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const { argv } = require("yargs");
const cron = require("node-cron");
const dateTime = require("date-and-time");
const { bodyParserGraphQL } = require("body-parser-graphql");
const { graphqlHTTP }  = require('express-graphql');
const { graphql, buildSchema } = require('graphql');
const { mergedTypes, mergedResolvers } = require("./shema");
const { schema, root } = require("./graphql/serverSchema");

const app = express();


const port = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname,"public")));
// app.use(`${config.server.context_path}`, router);

app.set('view engine', 'html');

// app.use("/graphql", graphqlHTTP({
//     schema: mergedTypes, 
//     graphiql: true, 
//     rootValue: mergedResolvers,
// }));

app.use("/graphql", graphqlHTTP({
    schema: schema, 
    graphiql: true, 
    rootValue: root,
}));

app.get("/",( req, res )=>{
    res.send("5002포트로 들어왔습니다.");
})

//node ==> deploy.js --mode=dev
//pm2  ==> pm2 start deploy.js --node-args="deploy.js --mode=dev" --name=mobile_api

// app.set("jwt-secret", config.jwt_secret);
app.set("jwt-secret",  "jwt");

if (argv.mode === "dev") {
    process.env.NODE_ENV = "development";
} else if (argv.mode === "prod") {
    process.env.NODE_ENV = "production";
} else {
    process.env.NODE_ENV = "development";
}



app.listen(port, ()=>{
    console.log(`포트번호 ${port}로 돌아가고 현재 ${process.env.NODE_ENV} 버전입니다.`);
})



















