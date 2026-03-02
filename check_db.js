const { Client } = require('pg');
const fs = require('fs');
const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'playground-dev'
});
async function run() {
    await client.connect();
    console.log('Inserting materials...');
    const sql = fs.readFileSync('s:/DVH/seed_materials.sql', 'utf8');
    await client.query(sql);
    console.log('Done!');
    await client.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
