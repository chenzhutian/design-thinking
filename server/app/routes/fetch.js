const express = require('express');
const router = new express.Router();
const fetchController = require('../controllers/fetchDataController');

/* GET users listing. */
router.get('/building', (req, res) => {
    const featureName = req.query.featureName;
    if (!featureName || !featureName.length) return;
    fetchController.fetchBuildingData(featureName, (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});

module.exports = router;
