// graphql schemas using merge-graphql-schemas
const path = require("path");
const { fileLoader, mergeTypes, mergeResolvers }  = require("merge-graphql-schemas");

const allTypes = fileLoader(path.join(__dirname, "graphql/**/*.graphql"));
const allResolvers = fileLoader(path.join(__dirname, "graphql/**/*.js"));


module.exports = {
    mergedTypes : mergeTypes(allTypes, { all: true }),
    mergedResolvers : mergeResolvers(allResolvers)
}


// export const mergedTypes = mergeTypes(allTypes, { all: true });
// export const mergedResolvers = mergeResolvers(allResolvers);