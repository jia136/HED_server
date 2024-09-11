import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function getCarInfo(tripid) {
    var command = 'SELECT * FROM vehicle_data_t WHERE tripid = ?'
    const [rows] = await pool.query(command, [tripid]);
    return rows
};

export async function getCarInfoAll() {
    var command = 'SELECT * FROM vehicle_data_t'
    const [rows] = await pool.query(command);
    return rows
};

export async function getInterval(VIN) {
    var command = 'SELECT intVal FROM int_data_t WHERE vinVal = ?'
    const [rows] = await pool.query(command, [VIN]);
    return rows
};

export async function setInterval(VIN, INT) {
    var command = 'REPLACE INTO int_data_t VALUES (?, ?)'
    const [rows] = await pool.query(command, [VIN, INT]);
    return rows
};

export async function setTripEvent(vin, tripid, event, lat, lng) {
    var command = 'INSERT INTO vehicle_data_t VALUES (?, ?, ?, ?, ?)'
    const [rows] = await pool.query(command, [vin, tripid, event, lat, lng]);
    return rows
};