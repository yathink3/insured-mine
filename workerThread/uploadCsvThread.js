const dbo = require('../database');
const fs = require('fs');
const csv = require('fast-csv');
const { workerData, parentPort } = require('worker_threads');

const convertCsvToJson = path =>
  new Promise((resolve, reject) => {
    let dataSet = [];
    fs.createReadStream(path)
      .pipe(csv.parse({ headers: true }))
      .on('error', reject)
      .on('data', row => dataSet.push(row))
      .on('end', () => resolve(dataSet));
  });

const groupBy = (data, key) => Array.from(data.reduce((entryMap, e) => entryMap.set(e[key], { ...(entryMap.get(e[key]) || {}), ...e }), new Map()).values());

const dynamicInsert = async insures => {
  const userCollection = dbo.getDb().collection('User');
  let userData = groupBy(insures, 'firstname').map(insure => ({
    first_name: insure.firstname,
    dob: insure.dob,
    address: insure.address,
    city: insure.city,
    state: insure.state,
    zip: insure.zip,
    phone: insure.phone,
    email: insure.email,
    gender: insure.gender,
    user_type: insure.userType,
  }));
  const oldUserData = await userCollection.find({}).toArray();
  userData = userData.filter(user => !oldUserData.find(old => old.first_name === user.first_name));
  if (userData.length > 0) await userCollection.insertMany(userData);
  userData = [...userData, ...oldUserData];

  const agentCollection = dbo.getDb().collection('Agent');
  let agentData = groupBy(insures, 'agent').map(insure => ({ agent: insure.agent }));
  const oldAgentData = await agentCollection.find({}).toArray();
  agentData = agentData.filter(agent => !oldAgentData.find(old => old.agent === agent.agent));
  if (agentData.length > 0) await agentCollection.insertMany(agentData);
  agentData = [...agentData, ...oldAgentData];

  const accountCollection = dbo.getDb().collection('UsersAccount');
  let accountData = groupBy(insures, 'account_name').map(insure => ({ account_name: insure.account_name }));
  const oldAccountData = await accountCollection.find({}).toArray();
  accountData = accountData.filter(account => !oldAccountData.find(old => old.account_name === account.account_name));
  if (accountData.length > 0) await accountCollection.insertMany(accountData);
  accountData = [...accountData, ...oldAccountData];

  const policyCategoryCollection = dbo.getDb().collection('PolicyCategory');
  let policyCategoryData = groupBy(insures, 'category_name').map(insure => ({ category_name: insure.category_name }));
  const oldPolicyCategoryData = await policyCategoryCollection.find({}).toArray();
  policyCategoryData = policyCategoryData.filter(category => !oldPolicyCategoryData.find(old => old.category_name === category.category_name));
  if (policyCategoryData.length > 0) await policyCategoryCollection.insertMany(policyCategoryData);
  policyCategoryData = [...policyCategoryData, ...oldPolicyCategoryData];

  const policyCarrierCollection = dbo.getDb().collection('PolicyCarrier');
  let policyCarrierData = groupBy(insures, 'company_name').map(insure => ({ company_name: insure.company_name }));
  const oldPolicyCarrierData = await policyCarrierCollection.find({}).toArray();
  policyCarrierData = policyCarrierData.filter(carrier => !oldPolicyCarrierData.find(old => old.company_name === carrier.company_name));
  if (policyCarrierData.length > 0) await policyCarrierCollection.insertMany(policyCarrierData);
  policyCarrierData = [...policyCarrierData, ...oldPolicyCarrierData];

  const policyInfoCollection = dbo.getDb().collection('PolicyInfo');
  let policyInfoData = groupBy(insures, 'policy_number').map(insure => ({
    policy_number: insure.policy_number,
    policy_start_date: insure.policy_start_date,
    policy_end_date: insure.policy_end_date,
    policy_status: insure.policy_status,
    policy_mode: insure.policy_mode,
    user_id: userData.find(user => user.first_name === insure.firstname)._id,
    agent_id: agentData.find(agent => agent.agent === insure.agent)._id,
    account_id: accountData.find(account => account.account_name === insure.account_name)._id,
    policy_category_id: policyCategoryData.find(category => category.category_name === insure.category_name)._id,
    policy_carrier_id: policyCarrierData.find(carrier => carrier.company_name === insure.company_name)._id,
  }));
  const oldPolicyInfoData = await policyInfoCollection.find({}).toArray();
  policyInfoData = policyInfoData.filter(policy => !oldPolicyInfoData.find(old => old.policy_number === policy.policy_number));
  if (policyInfoData.length > 0) await policyInfoCollection.insertMany(policyInfoData);
  policyInfoData = [...policyInfoData, ...oldPolicyInfoData];

  return policyInfoData;
};

dbo.connectToServer(async err => {
  if (err) {
    console.error(err);
    process.exit();
  }
  console.log('Worker thread started');
  const insures = await convertCsvToJson(workerData.path);
  const results = await dynamicInsert(insures);
  console.log('Worker thread finished');
  parentPort.postMessage({ results });
});
