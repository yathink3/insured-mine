const { Worker } = require('worker_threads');

const worker = (...params) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(...params);
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

module.exports = worker;
