"use strict";
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
class serverError extends Error {
}
const app = express();
const __DEVELOPMENT__ = app.get('env') === 'development';
const mongoPort = 27017;
mongoose.connect(`mongodb://localhost:${mongoPort}/design-thinking`);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.info('we are connect to db');
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
const staticPath = './public';
app.use(express.static(staticPath));
app.use(require('connect-history-api-fallback')());
app.use((req, res, next) => {
    const err = new serverError('Not Found');
    err.status = 404;
    next(err);
});
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