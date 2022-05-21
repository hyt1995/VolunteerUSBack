const { ApolloError } = require("apollo-server-errors");

const returnError = async (message, status) => {
  throw new ApolloError(message, "0", {
    code: "0",
    status: status,
    message: message,
  });
};

module.exports = {
  returnError,
};
