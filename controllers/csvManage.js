const dbo = require('../database');
const fs = require('fs');
const csv = require('fast-csv');

const upload = async (req, res) => {
  const dbConnect = dbo.getDb().collection('insurence-data');
  const path = __dirname + '/../resources/uploads/' + req.file.filename;
  let insures = [];

  try {
    if (req.file == undefined) return res.status(400).send('Please upload a CSV file!');
    fs.createReadStream(path)
      .pipe(csv.parse({ headers: true }))
      .on('error', error => {
        throw error.message;
      })
      .on('data', row => {
        insures.push(row);
      })
      .on('end', () => {
        dbConnect
          .insertMany(insures)
          .then(() => {
            res.status(200).send({
              message: 'Uploaded the file successfully: ' + req.file.originalname,
            });
          })
          .catch(error => {
            res.status(500).send({
              message: 'Fail to import data into database!',
              error: error.message,
            });
          });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Could not upload the file: ' + req.file.originalname,
    });
  }
};

const getInsures = (req, res) => {
  const dbConnect = dbo.getDb().collection('insurence-data');
  dbConnect
    .find({})
    .limit(50)
    .toArray((err, result) => {
      if (err)
        res.status(500).send({
          message: err.message || 'Some error occurred while retrieving insures.',
        });
      else res.send(result);
    });
};

const searchInsures = (req, res) => {
  const { userName } = req.body;
  const dbConnect = dbo.getDb().collection('insurence-data');
  dbConnect
    .find({ firstname: { $regex: userName } })
    .toArray()
    .then(result => {
      if (result && result.length > 0) {
        console.log(`Found a listing in the insurence of '${userName}'`);
        res.status(200).send({ message: `Results Found for '${userName}'`, data: result });
      } else {
        res.status(500).send({ message: `No results found for '${userName}'` });
      }
    })
    .catch(error => {
      res.status(500).send({
        message: 'Failed to fetch data in database!',
        error: error.message,
      });
    });
};

module.exports = { upload, getInsures, searchInsures };
