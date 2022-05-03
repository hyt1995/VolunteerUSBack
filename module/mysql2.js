const mysql = require('mysql2/promise');
const config = require("../config");

const getData = async ( sql, queryValue ) => {
    const poolGet = mysql.createPool(config.mysql);

    const connection1 = await poolGet.getConnection(async conn => {
        return conn
    });
    // const connection2 = await poolGet.getConnection(async conn => conn);

    connection1.beginTransaction();
    // connection2.beginTransaction();

    let result = await connection1.query(sql, queryValue);

    connection1.commit();

    connection1.release();

    return result;
};

// 다중 쿼리를 위한
const multiQuery = async (sql) => {};

module.exports = {
    getData,
    multiQuery,
}

