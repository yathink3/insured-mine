const dbo = require('../database');

const dynamicInsert = async insures => {
  let userData = [],
    agentData = [],
    accountData = [],
    policyCategoryData = [],
    policyCarrierData = [],
    policyInfoData = [];
  const dbset = dbo.getDb();

  const createOrGetUserDetails = async userDetails => {
    const dbConnect = dbset.collection('User');
    try {
      const findUser = userData.find(user => user.first_name === userDetails.first_name);
      if (findUser) return findUser.user_id;
      const query = { first_name: userDetails.first_name };
      const result = await dbConnect.findOne(query);
      if (result) {
        userData.push({ first_name: userDetails.first_name, user_id: result._id });
        return result._id;
      } else {
        const insertedData = await dbConnect.insertOne(userDetails);
        userData.push({ first_name: userDetails.first_name, user_id: insertedData.insertedId });
        return insertedData.insertedId;
      }
    } catch (error) {
      throw error;
    }
  };

  const createOrGetAgentDetails = async agentDetails => {
    const dbConnect = dbset.collection('Agent');
    try {
      const findAgent = agentData.find(agent => agent.agent === agentDetails.agent);
      if (findAgent) return findAgent.agent_id;
      const query = { agent: agentDetails.agent };
      const result = await dbConnect.findOne(query);
      if (result) {
        agentData.push({ agent: agentDetails.agent, agent_id: result._id });
        return result._id;
      } else {
        const insertedData = await dbConnect.insertOne(agentDetails);
        agentData.push({ agent: agentDetails.agent, agent_id: insertedData.insertedId });
        return insertedData.insertedId;
      }
      if (result) return result._id;
      const insertedData = await dbConnect.insertOne(agentDetails);
      return insertedData.insertedId;
    } catch (error) {
      throw error;
    }
  };

  const createOrGetUsersAccount = async accountDetails => {
    const dbConnect = dbset.collection('UsersAccount');
    try {
      const findAccount = accountData.find(account => account.account_name === accountDetails.account_name);
      if (findAccount) return findAccount.account_id;
      const query = { account_name: accountDetails.account_name };
      const result = await dbConnect.findOne(query);
      if (result) {
        accountData.push({ account_name: accountDetails.account_name, account_id: result._id });
        return result._id;
      } else {
        const insertedData = await dbConnect.insertOne(accountDetails);
        accountData.push({ account_name: accountDetails.account_name, account_id: insertedData.insertedId });
        return insertedData.insertedId;
      }
    } catch (error) {
      throw error;
    }
  };

  const createOrGetPolicyCategory = async policyCategoryDetails => {
    const dbConnect = dbset.collection('PolicyCategory');
    try {
      const findPolicyCategory = policyCategoryData.find(policyCategory => policyCategory.category_name === policyCategoryDetails.category_name);
      if (findPolicyCategory) return findPolicyCategory.category_id;
      const query = { category_name: policyCategoryDetails.category_name };
      const result = await dbConnect.findOne(query);
      if (result) {
        policyCategoryData.push({ category_name: policyCategoryDetails.category_name, category_id: result._id });
        return result._id;
      } else {
        const insertedData = await dbConnect.insertOne(policyCategoryDetails);
        policyCategoryData.push({ category_name: policyCategoryDetails.category_name, category_id: insertedData.insertedId });
        return insertedData.insertedId;
      }
    } catch (error) {
      throw error;
    }
  };

  const createOrGetPolicyCarrier = async policyCarrierDetails => {
    const dbConnect = dbset.collection('PolicyCarrier');
    try {
      const findPolicyCarrier = policyCarrierData.find(policyCarrier => policyCarrier.company_name === policyCarrierDetails.company_name);
      if (findPolicyCarrier) return findPolicyCarrier.company_id;
      const query = { company_name: policyCarrierDetails.company_name };
      const result = await dbConnect.findOne(query);
      if (result) {
        policyCarrierData.push({ company_name: policyCarrierDetails.company_name, company_id: result._id });
        return result._id;
      } else {
        const insertedData = await dbConnect.insertOne(policyCarrierDetails);
        policyCarrierData.push({ company_name: policyCarrierDetails.company_name, company_id: insertedData.insertedId });
        return insertedData.insertedId;
      }
    } catch (error) {
      throw error;
    }
  };

  const createOrGetPolicyInfo = async policyInfoDetails => {
    const dbConnect = dbset.collection('PolicyInfo');
    try {
      const findPolicyInfo = policyInfoData.find(policyInfo => policyInfo.policy_number === policyInfoDetails.policy_number);
      if (findPolicyInfo) return findPolicyInfo.policy_id;
      const query = { policy_number: policyInfoDetails.policy_number };
      const result = await dbConnect.findOne(query);
      if (result) {
        policyInfoData.push({ policy_number: policyInfoDetails.policy_number, policy_id: result._id });
        return result._id;
      } else {
        const insertedData = await dbConnect.insertOne(policyInfoDetails);
        policyInfoData.push({ policy_number: policyInfoDetails.policy_number, policy_id: insertedData.insertedId });
        return insertedData.insertedId;
      }
    } catch (error) {
      throw error;
    }
  };

  for (let i = 0; i < insures.length; i++) {
    const insure = insures[i];
    const userDetails = { first_name: insure.firstname, dob: insure.dob, address: insure.address, city: insure.city, state: insure.state, zip: insure.zip, phone: insure.phone, email: insure.email, gender: insure.gender, user_type: insure.userType };
    const user_id = await createOrGetUserDetails(userDetails);
    // const agentDetails = { agent: insure.agent };
    // const agent_id = await createOrGetAgentDetails(agentDetails);
    // const accountDetails = { account_name: insure.account_name };
    // const account_id = await createOrGetUsersAccount(accountDetails);
    // const policyCategoryDetails = { category_name: insure.category_name };
    // const policy_category_id = await createOrGetPolicyCategory(policyCategoryDetails);
    // const policyCarrierDetails = { company_name: insure.company_name };
    // const policy_carrier_id = await createOrGetPolicyCarrier(policyCarrierDetails);
    // const policyInfoDetails = { policy_number: insure.policy_number, policy_start_date: insure.policy_start_date, policy_end_date: insure.policy_end_date, policy_status: insure.policy_status, policy_mode: insure.policy_mode, policy_category_id, policy_carrier_id, user_id, agent_id, account_id };
    // const policy_info_id = await createOrGetPolicyInfo(policyInfoDetails);
    // console.log(policyInfoData);
  }
  console.log(userData);
};

module.exports = dynamicInsert;
