const dbo = require('../database');
const fs = require('fs');
const csv = require('fast-csv');
const dynamicInsert = require('../model/insureModeling');
const dynamicInsertGroupBy = require('../model/insureModelingGroupBy');

const convertCsvToJson = path =>
  new Promise((resolve, reject) => {
    let dataSet = [];
    fs.createReadStream(path)
      .pipe(csv.parse({ headers: true }))
      .on('error', reject)
      .on('data', row => dataSet.push(row))
      .on('end', () => resolve(dataSet));
  });

const upload = async (req, res) => {
  const dbConnect = dbo.getDb().collection('insurence-data');
  const path = __dirname + '/../resources/uploads/' + req.file.filename;
  try {
    if (req.file == undefined) return res.status(400).send('Please upload a CSV file!');
    const insures = await convertCsvToJson(path);
    // await dynamicInsert(insures);
    await dynamicInsertGroupBy(insures);
    return res.status(200).send({ message: 'Uploaded the file successfully: ' + req.file.originalname });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'Fail to import data into database!', error: error.message });
  }
};

const getInsures = async (req, res) => {
  const dbConnect = dbo.getDb().collection('insurence-data');
  try {
    const result = await dbConnect.find({}).limit(50).toArray();
    return res.send(result);
  } catch (error) {
    return res.status(500).send({ message: error.message || 'Some error occurred while retrieving insures.' });
  }
};

const searchInsures = async (req, res) => {
  const { userName } = req.body;
  const dbConnect = dbo.getDb().collection('insurence-data');
  try {
    const query = { firstname: { $regex: userName } };
    const result = await dbConnect.find(query).limit(50).toArray();
    if (result.length === 0) return res.status(404).send({ message: 'No insures found with the given name.' });
    else return res.status(200).send({ message: `Results Found for '${userName}'`, data: result });
  } catch (error) {
    return res.status(500).send({ message: 'Failed to fetch data in database!', error: error.message });
  }
};

module.exports = { upload, getInsures, searchInsures };
