const { makeExecutableSchema } = require("@graphql-tools/schema");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const { loadFilesSync } = require("@graphql-tools/load-files");

// 각각의 스키마, 스키마 리졸브 파일을 읽어와 합쳐줍니다.
const allTypes = loadFilesSync('graphql/**/*.graphql');
const allResolvers = loadFilesSync('graphql/**/*.{js,ts}');

// 여기서 스키마 형식으로 만들어줍니다
// 자체 모듈내에서 let으로 선언된 변수를 묶기 위해

let  schema = makeExecutableSchema({
    typeDefs: mergeTypeDefs(allTypes),
    resolvers: mergeResolvers(allResolvers),
});


module.exports = schema;