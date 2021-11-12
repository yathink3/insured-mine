const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let dbConnection;

module.exports = {
  connectToServer(callback) {
    client.connect((err, db) => {
      if (err || !db) return callback(err);
      dbConnection = db.db(process.env.DATABASE);
      console.log('Successfully connected to MongoDB.');
      return callback();
    });
  },
  getDb() {
    return dbConnection;
  },
};
