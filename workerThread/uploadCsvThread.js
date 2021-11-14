const dbo = require('../database');
const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');
const fs = require('fs');
const csv = require('fast-csv');

const convertCsvToJson = filename =>
  new Promise((resolve, reject) => {
    const path = __dirname + '/../resources/uploads/' + filename;
    let dataSet = [];
    fs.createReadStream(path)
      .pipe(csv.parse({ headers: true }))
      .on('error', reject)
      .on('data', row => dataSet.push(row))
      .on('end', () => (fs.unlinkSync(path), resolve(dataSet)));
  });

const groupBy = (data, key) => Array.from(data.reduce((entryMap, e) => entryMap.set(e[key], { ...(entryMap.get(e[key]) || {}), ...e }), new Map()).values());

const dynamicInsert = async insures => {
  const policyInfoCollection = dbo.getDb().collection('PolicyInfo');
  const oldPolicyInfoData = await policyInfoCollection.find({}).toArray();
  const newPolicyInfoData = insures.filter(policy => !oldPolicyInfoData.find(old => old.policy_number === policy.policy_number));
  if (newPolicyInfoData.length > 0) {
    const userCollection = dbo.getDb().collection('User');
    const oldUserData = await userCollection.find({ $or: newPolicyInfoData.map(({ firstname }) => ({ first_name: firstname })) }).toArray();
    let userData = groupBy(newPolicyInfoData, 'firstname').map(insure => ({
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
    userData = userData.filter(user => !oldUserData.find(old => old.first_name === user.first_name));
    if (userData.length > 0) await userCollection.insertMany(userData);
    userData = [...userData, ...oldUserData];

    const agentCollection = dbo.getDb().collection('Agent');
    const oldAgentData = await agentCollection.find({ $or: newPolicyInfoData.map(({ agent }) => ({ agent })) }).toArray();
    let agentData = groupBy(newPolicyInfoData, 'agent').map(insure => ({ agent: insure.agent }));
    agentData = agentData.filter(agent => !oldAgentData.find(old => old.agent === agent.agent));
    if (agentData.length > 0) await agentCollection.insertMany(agentData);
    agentData = [...agentData, ...oldAgentData];

    const accountCollection = dbo.getDb().collection('UsersAccount');
    const oldAccountData = await accountCollection.find({ $or: newPolicyInfoData.map(({ account_name }) => ({ account_name })) }).toArray();
    let accountData = groupBy(newPolicyInfoData, 'account_name').map(insure => ({ account_name: insure.account_name, account_type: insure.account_type }));
    accountData = accountData.filter(account => !oldAccountData.find(old => old.account_name === account.account_name));
    if (accountData.length > 0) await accountCollection.insertMany(accountData);
    accountData = [...accountData, ...oldAccountData];

    const policyCategoryCollection = dbo.getDb().collection('PolicyCategory');
    const oldPolicyCategoryData = await policyCategoryCollection.find({ $or: newPolicyInfoData.map(({ category_name }) => ({ category_name })) }).toArray();
    let policyCategoryData = groupBy(newPolicyInfoData, 'category_name').map(insure => ({ category_name: insure.category_name }));
    policyCategoryData = policyCategoryData.filter(category => !oldPolicyCategoryData.find(old => old.category_name === category.category_name));
    if (policyCategoryData.length > 0) await policyCategoryCollection.insertMany(policyCategoryData);
    policyCategoryData = [...policyCategoryData, ...oldPolicyCategoryData];

    const policyCarrierCollection = dbo.getDb().collection('PolicyCarrier');
    const oldPolicyCarrierData = await policyCarrierCollection.find({ $or: newPolicyInfoData.map(({ company_name }) => ({ company_name })) }).toArray();
    let policyCarrierData = groupBy(newPolicyInfoData, 'company_name').map(insure => ({ company_name: insure.company_name }));
    policyCarrierData = policyCarrierData.filter(carrier => !oldPolicyCarrierData.find(old => old.company_name === carrier.company_name));
    if (policyCarrierData.length > 0) await policyCarrierCollection.insertMany(policyCarrierData);
    policyCarrierData = [...policyCarrierData, ...oldPolicyCarrierData];

    let policyInfoData = newPolicyInfoData.map(insure => ({
      policy_number: insure.policy_number,
      policy_start_date: insure.policy_start_date,
      policy_end_date: insure.policy_end_date,
      policy_status: insure.policy_status,
      policy_mode: insure.policy_mode,
      producer: insure.producer,
      premium_amount: insure.premium_amount,
      policy_type: insure.policy_type,
      csr: insure.csr,
      user_id: userData.find(user => user.first_name === insure.firstname)._id,
      agent_id: agentData.find(agent => agent.agent === insure.agent)._id,
      account_id: accountData.find(account => account.account_name === insure.account_name)._id,
      policy_category_id: policyCategoryData.find(category => category.category_name === insure.category_name)._id,
      policy_carrier_id: policyCarrierData.find(carrier => carrier.company_name === insure.company_name)._id,
    }));
    await policyInfoCollection.insertMany(policyInfoData);
    return { message: `New ${policyInfoData.length} data are inserted` };
  }
  return { message: `No New Data inserted` };
};

const worker = data => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: { data } });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

const runScirpt = async () => {
  const filename = workerData.data;
  const insures = await convertCsvToJson(filename);
  dbo.connectToServer(async err => {
    if (err) console.error(err), process.exit();
    const results = await dynamicInsert(insures);
    parentPort.postMessage({ results });
  });
};

if (isMainThread) {
  module.exports = worker;
} else {
  runScirpt();
}
