const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'playground-dev'
});
async function run() {
    await client.connect();
    console.log('truncating tables...');
    await client.query(`
    TRUNCATE TABLE tag_group CASCADE;
    TRUNCATE TABLE standard_groups CASCADE;
    TRUNCATE TABLE category_desc CASCADE;
  `);
    console.log('running seed script...');
    const sqlPath = path.join(__dirname, '..', 'seed_standard_data.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sql);
    console.log('done');
    await client.end();
}
run().catch(console.error);
