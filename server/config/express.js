const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// const mongoose = require('mongoose');
// const mongoPort = app.get('env') === 'development' ? 27017 : 27017;
// mongoose.connect(`mongodb://localhost:${mongoPort}/vastchallenge2016`);

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//     console.info('we are connect to db');
// });

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
if (app.get('env') === 'development') {
    app.use(cors({
        origin: 'http://localhost:8080',
    }));
}

// router here
// const fetchData = require('../app/routes/fetch');
// app.use('/resource', express.static(path.join(__dirname, '../resource')));
app.use(express.static(path.join(__dirname, '../public')));
// app.use('/fetch', fetchData);

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')());

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
    });
});

module.exports = app;
