const mongoose = require('mongoose');
const buildingDataSchema = new mongoose.Schema({
    featureName: String,
    category: String,
    data: [{
        date: Date,
        value: Number,
    }],
}, { collection: 'building', timestamps: true });

module.exports = mongoose.model('BuildingData', buildingDataSchema);
