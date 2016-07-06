"use strict";
const path = require('path');
const express = require('express');
const multer = require('multer');
const messageController_1 = require('../controllers/messageController');
const router = express.Router();
const acceptedImageMimeTypes = {
    'audio/mp4': true,
    'audio/mpeg': true,
    'audio/vnd.wav': true,
};
const audioMulterOption = {
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './resource/');
        }
    }),
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: (req, file, callback) => {
        if (acceptedImageMimeTypes[file.mimetype]) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    }
};
router.post('/', multer(audioMulterOption).single('audioFile'), (req, res) => {
    const uploadedFile = req.file;
    if (!uploadedFile) {
        res.send(false);
        return;
    }
    const messageData = {
        filePath: path.join('/', uploadedFile.path),
        roomName: req.body.roomName,
        userType: req.body.userType,
        isRead: false,
        isReceive: false,
    };
    messageController_1.default.insertMessage(messageData, (err, result) => {
        if (err) {
            res.send(false);
            throw err;
        }
        res.send(result);
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=message.js.map