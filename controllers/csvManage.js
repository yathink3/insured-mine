const dbo = require('../database');
const worker = require('../workerThread/workerService');

const upload = async (req, res) => {
  const path = __dirname + '/../resources/uploads/' + req.file.filename;
  try {
    if (req.file == undefined) return res.status(400).send('Please upload a CSV file!');
    await worker('./workerThread/uploadCsvThread.js', { workerData: { path } });
    return res.status(200).send({ message: 'Uploaded file successfully: ' + req.file.originalname });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'Fail to import data into database!', error: error.message });
  }
};

const getInsures = async (req, res) => {
  try {
    const query = [
      { $lookup: { from: 'PolicyInfo', localField: '_id', foreignField: 'user_id', as: 'PolicyInfo' } },
      { $lookup: { from: 'Agent', localField: 'PolicyInfo.agent_id', foreignField: '_id', as: 'AgentData' } },
      { $lookup: { from: 'UsersAccount', localField: 'PolicyInfo.account_id', foreignField: '_id', as: 'UsersAccountData' } },
      { $lookup: { from: 'PolicyCategory', localField: 'PolicyInfo.policy_category_id', foreignField: '_id', as: 'PolicyCategoryData' } },
      { $lookup: { from: 'PolicyCarrier', localField: 'PolicyInfo.policy_carrier_id', foreignField: '_id', as: 'PolicyCarrierData' } },
      { $project: { 'PolicyInfo.user_id': 0, 'PolicyInfo.agent_id': 0, 'PolicyInfo.account_id': 0, 'PolicyInfo.policy_category_id': 0, 'PolicyInfo.policy_carrier_id': 0 } },
    ];
    const result = await dbo.getDb().collection('User').aggregate(query).limit(50).toArray();
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
      { $lookup: { from: 'PolicyInfo', localField: '_id', foreignField: 'user_id', as: 'PolicyInfo' } },
      { $lookup: { from: 'Agent', localField: 'PolicyInfo.agent_id', foreignField: '_id', as: 'AgentData' } },
      { $lookup: { from: 'UsersAccount', localField: 'PolicyInfo.account_id', foreignField: '_id', as: 'UsersAccountData' } },
      { $lookup: { from: 'PolicyCategory', localField: 'PolicyInfo.policy_category_id', foreignField: '_id', as: 'PolicyCategoryData' } },
      { $lookup: { from: 'PolicyCarrier', localField: 'PolicyInfo.policy_carrier_id', foreignField: '_id', as: 'PolicyCarrierData' } },
      { $project: { 'PolicyInfo.user_id': 0, 'PolicyInfo.agent_id': 0, 'PolicyInfo.account_id': 0, 'PolicyInfo.policy_category_id': 0, 'PolicyInfo.policy_carrier_id': 0 } },
    ];
    const result = await dbo.getDb().collection('User').aggregate(query).limit(50).toArray();
    return res.status(200).send({ message: `Results Found for '${userName}'`, data: result });
  } catch (error) {
    return res.status(500).send({ message: 'Failed to fetch data in database!', error: error.message });
  }
};

module.exports = { upload, getInsures, searchInsures };
