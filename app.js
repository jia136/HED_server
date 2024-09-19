import { fileURLToPath } from 'url';
import new_path from 'path';
import { getCarInfo } from './database.js';
import { getCarInfoAll } from './database.js';
import { setInterval } from './database.js';
import { getInterval } from './database.js';
import { setTripEvent } from './database.js';
import { setEsp32Data } from './database.js';
import { getEsp32Data } from './database.js';
import { getEsp32DataAll } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new_path.dirname(__filename);

import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

/** POST /intervalSet - interval value for specific VIN from backend is send to db */
app.post('/intervalSet', async (req, res) => {
  const { vinVal, intVal } = req.body
  console.log(vinVal);
  console.log(intVal);
  setInterval(vinVal, intVal);
  res.sendStatus(201)
});
/** POST /intInfo - send interval value to client */
app.post('/intInfo', async (req, res) => {
  const { vinVal } = req.body
  console.log(vinVal);
  const interval = await getInterval(vinVal);
  res.json({
    status: 'success',
    data: JSON.stringify(interval)
  });
});
/** POST /tripData - put trip info from client to db */
app.post('/tripData', async (req, res) => {
  const { vin, tripid, hes } = req.body
  res.sendStatus(201)
  let string = hes.split("@");
  for (let i = 0; i < string.length - 1; i++) {
    let tripData = string[i].split(",");
    setTripEvent(vin, tripid, tripData[0], tripData[1], tripData[2]); //vin, tripid, event, lat, lng
  }
});
/** POST /clikedCarInfo - get trip info from db and sent it to frontend */
app.post('/clikedCarInfo', async (req, res) => {
  const { tripid } = req.body
  console.log(tripid);
  const CarInfo = await getCarInfo(tripid);
  res.status(201).send(CarInfo);
});
/** GET /clikedCarInfoAll - get trip info for all cars from db and sent it to frontend */
app.get('/clikedCarInfoAll', async (req, res) => {
  console.log("all car");
  const CarInfoAll = await getCarInfoAll();
  res.status(201).send(CarInfoAll);
});

/** POST /esp32data - put info from esp32 to database */
app.post('/esp32dataPost', async (req, res) => {
  const { vin, data0, data1, data2, data3 } = req.body
  console.log(vin, data0, data1, data2, data3);
  res.sendStatus(201)
  setEsp32Data(vin, data0, data1, data2, data3); // vin, data0, data1, data2, data3
});

/** POST /esp32dataGet - get data for specific vin from database and send it */
app.post('/esp32dataGet', async (req, res) => {  
  const { vin } = req.body
  console.log(vin);  
  const espData = await getEsp32Data(vin); // vin
  res.status(201).send(espData);
  console.log(espData);
});

/** GET /esp32dataGetAll - get all data from esp_data_t, used to list all availables vin to user */
app.get('/esp32dataGetAll', async (req, res) => {  
  const espData = await getEsp32DataAll(); // AllVINs
  res.status(201).send(espData);
  console.log(espData);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app