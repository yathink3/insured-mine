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
  const dbConnect = dbo.getDb().collection('PolicyInfo');
  try {
    const result = await dbConnect.find({}).limit(50).toArray();
    return res.send(result);
  } catch (error) {
    return res.status(500).send({ message: error.message || 'Some error occurred while retrieving insures.' });
  }
};

const searchInsures = async (req, res) => {
  const { userName } = req.body;

  try {
    const query = [
      { $match: { first_name: { $regex: userName } } },
      {
        $lookup: {
          from: 'PolicyInfo',
          localField: '_id',
          foreignField: 'user_id',
          as: 'PolicyInfo',
        },
      },
      {
        $lookup: {
          from: 'Agent',
          localField: 'PolicyInfo.agent_id',
          foreignField: '_id',
          as: 'AgentData',
        },
      },
      {
        $project: {
          'PolicyInfo.user_id': 0,
          'PolicyInfo.agent_id': 0,
          'PolicyInfo.account_id': 0,
          'PolicyInfo.policy_category_id': 0,
          'PolicyInfo.policy_carrier_id': 0,
        },
      },
    ];
    const result = await dbo.getDb().collection('User').aggregate(query).limit(50).toArray();
    return res.status(200).send({ message: `Results Found for '${userName}'`, data: result });
  } catch (error) {
    return res.status(500).send({ message: 'Failed to fetch data in database!', error: error.message });
  }
};

module.exports = { upload, getInsures, searchInsures };

// db.somecollection.aggregate([{
//   $lookup: {
//       from: "campaigns",
//       localField: "campId",
//       foreignField: "_id",
//       as: "campaign"
//   }
// }, {
//   $unwind: "$campaign"
// }, {
//   $lookup: {
//       from: "entities",
//       let: {clientid: '$campaign.clientid'},
//       pipeline: [
//          { '$match':
//            { '$expr':
//              {
//                 '$eq': ['$_id', '$$clientid']
//              }
//            }
//          },
//          { '$project':
//             '_id': 1,
//             'username': 1
//          }
//       ]
//       as: "campaign.client"
//   }
// }]);
