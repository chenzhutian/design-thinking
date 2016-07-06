import * as path from 'path';
import * as express from 'express';
import * as multer from 'multer';
import messageController from '../controllers/messageController';
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
        } else {
            callback(null, false);
        }
    }
}

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
        isReceived: false,
    }
    messageController.insertMessage(messageData, (err, result) => {
        if (err) {
            res.send(false);
            throw err;
        }
        res.send(result);
    });
});

export default router;