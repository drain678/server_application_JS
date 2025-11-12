import pg from 'pg';
import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const { Pool } = pg;

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST, // не нужно никакого условия, используем переменную
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
});

pool
    .connect()
    .then(client => {
        console.log('Подключение к базе успешно');
        client.release();
    })
    .catch(err => {
        console.error('Ошибка подключения к базе', err.stack);
    });

export default pool;
