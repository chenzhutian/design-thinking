"use strict";
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
class serverError extends Error {
}
const app = express();
const __DEVELOPMENT__ = app.get('env') === 'development';
// const mongoPort = app.get('env') === 'development' ? 27015 : 27017;
// mongoose.connect(`mongodb://localhost:${mongoPort}/design-thinking`);
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
if (__DEVELOPMENT__) {
    app.use(cors({
        origin: 'http://localhost:8080',
    }));
}
// router here
// const fetchData = require('../app/routes/fetch');
// app.use('/resource', express.static(path.join(__dirname, '../resource')));
const staticPath = __DEVELOPMENT__ ? path.join(__dirname, '../../public') : './public';
app.use(express.static(staticPath));
// app.use('/fetch', fetchData);
// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')());
// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new serverError('Not Found');
    err.status = 404;
    next(err);
});
// error handlers
// development error handler
// will print stacktrace
app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: __DEVELOPMENT__ ? err : {},
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = app;
//# sourceMappingURL=express.js.map