const pm2 = require('pm2');

pm2.connect(error => {
  if (error) console.error(error), process.exit(2);

  pm2.start({ script: './server.js' }, (error, apps) => {
    pm2.disconnect();
    if (error) console.error(error), process.exit(2);
  });

  setInterval(() => {
    pm2.describe('server', async (error, scripts) => {
      if (error) console.error(error), process.exit(2);
      const server = scripts[0];
      console.log(`${server.name} - cpu:${server.monit.cpu}% , memory:${server.monit.memory}`);
      if (server.monit.cpu > 70) {
        console.log(`Closing cluster after cpu: ${server.monit.cpu}% usage.`);
        pm2.restart('server', error => error && (console.error(error), process.exit(2)));
      }
    });
  }, 30 * 1000);
});
