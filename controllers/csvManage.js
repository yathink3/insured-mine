const dbo = require('../database');
const fs = require('fs');
const csv = require('fast-csv');

const convertCsvToJson = path =>
  new Promise((resolve, reject) => {
    let dataSet = [];
    fs.createReadStream(path)
      .pipe(csv.parse({ headers: true }))
      .on('error', reject)
      .on('data', row => insures.push(row))
      .on('end', () => resolve(dataSet));
  });

const upload = async (req, res) => {
  const dbConnect = dbo.getDb().collection('insurence-data');
  const path = __dirname + '/../resources/uploads/' + req.file.filename;
  try {
    if (req.file == undefined) return res.status(400).send('Please upload a CSV file!');
    const insures = await convertCsvToJson(path);
    dbConnect
      .insertMany(insures)
      .then(() => {
        return res.status(200).send({ message: 'Uploaded the file successfully: ' + req.file.originalname });
      })
      .catch(error => {
        return res.status(500).send({ message: 'Fail to import data into database!', error: error.message });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'Could not upload the file: ' + req.file.originalname });
  }
};

const getInsures = (req, res) => {
  const dbConnect = dbo.getDb().collection('insurence-data');
  dbConnect
    .find({})
    .limit(50)
    .toArray((err, result) => {
      if (err) return res.status(500).send({ message: err.message || 'Some error occurred while retrieving insures.' });
      else return res.send(result);
    });
};

const searchInsures = (req, res) => {
  const { userName } = req.body;
  const dbConnect = dbo.getDb().collection('insurence-data');
  dbConnect
    .find({ firstname: { $regex: userName } })
    .limit(50)
    .toArray()
    .then(result => {
      if (result && result.length > 0) return res.status(200).send({ message: `Results Found for '${userName}'`, data: result });
      else return res.status(500).send({ message: `No results found for '${userName}'` });
    })
    .catch(error => {
      return res.status(500).send({ message: 'Failed to fetch data in database!', error: error.message });
    });
};

module.exports = { upload, getInsures, searchInsures };
