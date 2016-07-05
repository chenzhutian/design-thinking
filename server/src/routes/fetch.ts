import * as express from 'express';
import fetchController from '../controllers/fetchDataController';
const router = express.Router();


/* GET users listing. */
router.get('/building', (req, res) => {
    const featureName = req.query.featureName;
    if (!featureName || !featureName.length) return;
    fetchController.fetchBuildingData(featureName, (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});

export default router;
