const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/vastchallenge2016';
const fs = require('fs');
const d3 = require('d3');

fs.readFile('./bldg-MC2.csv', 'utf8', (err, data) => {
    if (err) throw err;
    const buildingData = d3.csvParse(data, d => {
        Object.keys(d).forEach(p => {
            switch (p) {
                case 'Date/Time': {
                    d['Date/Time'] = new Date(d['Date/Time']);
                    break;
                }
                default:
                    d[p] = +d[p];
            }
        });
        return d;
    });
    const tempBuildingData = {};
    buildingData.forEach(d => {
        const tempDate = d['Date/Time'];
        Object.keys(d).forEach(p => {
            if (p !== 'Date/Time') {
                if (!(p in tempBuildingData)) {
                    tempBuildingData[p] = [];
                }
                tempBuildingData[p].push({
                    value: d[p],
                    date: tempDate,
                });
            }
        });
    });


    const tempFeatures = Object.keys(buildingData[0]).filter(d => d !== 'Date/Time')
        .map(f => {
            let category;
            if (f.startsWith('F_')) {
                category = `f${f[2]}`;
            } else {
                category = 'general';
            }
            return { name: f, category };
        });
    fs.writeFile('./bldg-features.csv', d3.csvFormat(tempFeatures), werr => {
        if (werr) throw werr;
        console.log('writeFile finished!');
    });


    MongoClient.connect(url, (mongoerr, db) => {
        if (mongoerr) throw mongoerr;
        console.log('connect to mongodb');
        const buildingDataToInsert = Object.keys(tempBuildingData)
            .map(f => {
                let category;
                if (f.startsWith('F_')) {
                    category = `f${f[2]}`;
                } else {
                    category = 'general';
                }
                return { featureName: f, category, data: tempBuildingData[f] };
            });
        db.collection('building').insertMany(buildingDataToInsert, insertErr => {
            if (insertErr) throw insertErr;
            console.log('insert finished');
            db.collection('building')
                .createIndex(
                { featureName: 1 },
                null,
                (indexErr, results) => {
                    console.log(results);
                }
                );
        });
    });
});
