const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'playground-dev'
});
async function run() {
    await client.connect();
    const res = await client.query("SELECT id, description, type FROM materials ORDER BY id ASC LIMIT 10");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}
run().catch(console.error);
