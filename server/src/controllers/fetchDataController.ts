const BuildingData = require('../models/buildingData');

function fetchBuildingData(featureName, callback) {
    if (typeof featureName !== 'string') {
        callback(null, []);
    }
    BuildingData
        .find({
            featureName,
        })
        .exec(callback);
}

module.exports = {
    fetchBuildingData,
};
