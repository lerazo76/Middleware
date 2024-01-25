const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

function createPool()
{
    var pool;

    pool = new Pool
    ({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: 5432,
    });
    console.log("Connected...");
    return pool;
}

async function executeQuery(pool, sql) 
{
    let results;

    try
    {   
        let client = await pool.connect();
        
        results = await client.query(sql);
        client.release();
    }
    catch(error)
    {
        console.error(error);
    }
    
    return results;
}

module.exports = 
{
    createPool,
    executeQuery
}