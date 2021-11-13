const dbo = require('../database/index');

let timer = null;

const checkSchedulerForTask = async () => {
  clearTimeout(timer);
  const Scheduler = dbo.getDb().collection('Scheduler');
  let data = await Scheduler.findOne({ executeOn: { $lte: new Date() } });
  console.log('checkSchedulerForTask', new Date(), data);
  if (!data) {
    timer = setTimeout(() => {
      checkSchedulerForTask();
    }, 2000);
    return;
  } else {
    switch (data.taskType) {
      case 'push':
        pushtoCollection(data);
      default:
    }
    await Scheduler.deleteOne({ _id: data._id });
    checkSchedulerForTask();
  }
};

const pushtoCollection = async ({ message }) => {
  const collConn = dbo.getDb().collection('Collections');
  const result = await collConn.insertOne({ message, createdOn: new Date() });
};

const scheduleJob = async (req, res) => {
  const { message, day, time } = req.body;
  const executeOn = new Date(`${day} ${time}`);
  console.log({ message, executeOn });
  const Scheduler = dbo.getDb().collection('Scheduler');
  const result = await Scheduler.insertOne({ message, executeOn, taskType: 'push' });
  checkSchedulerForTask();
  return res.send({ message: `Job Created on ${executeOn.toISOString()}` });
};

module.exports = { scheduleJob };
