import * as mongoose from 'mongoose';
const buildingDataSchema = new mongoose.Schema({
    featureName: String,
    category: String,
    data: [{
        date: Date,
        value: Number,
    }],
}, { collection: 'building', timestamps: true });

export default mongoose.model('BuildingData', buildingDataSchema);
