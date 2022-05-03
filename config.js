let config = require("./config_dev");

if(process.env.NODE_ENV === "prod") {
    config = require("./config_prod");
}else {
    config = require("./config_dev");
}



module.exports = config;