const config = {
    env: "production",
    server : {
        host: "http://54.226.206.18:5001/coinServer/",
        port : 5001,
        ssl: false,
        context_path : "/coinServer"
    },
    swagger: {
        host: "54.226.206.18:5001/coinServer"
    },
    mysql: {
        host : "127.0.0.1",
        port: "5506",
        user: "root",
        password:"1234",
        database : "coinAutoInfo",
        connectionLimit : 30
    }
};