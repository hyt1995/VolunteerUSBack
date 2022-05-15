const config = {
    env: "development",
    loglevel : "info",
    server : {
        host: "http://localhost:5002/volteer/",
        port : 5002,
        ssl: false,
        context_path : "/volunteerUS"
    },
    jwt_secret: "volunteerUSInFo",
    swagger: {
        host: "localhost:5002/volunteerUS"
    },
    mysql: {
        host : "34.204.13.200",
        port: "3306",
        user: "korpcRoot",
        password:"Korpcdream21!",
        database : "voluntedInfo",
        connectionLimit : 100
    }
};


module.exports = config;