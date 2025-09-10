import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

const pool = new Pool(
    {
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
    }
);

pool.connect().then(client => { console.log('Подключение к базе успешно'); client.release(); }).catch(err => {
    console.error('Ошибка подключения к базе', err.stack);
});

export default pool;