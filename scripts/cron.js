const CronJob = require('cron').CronJob;
const update = require('./update-tournament-data');
const updateLor = require('./update-lor');

function startCronJob() {
  const job = new CronJob('0 0 * * * *', function() {
    update();
    updateLor();
  });

  job.start();
}

module.exports.startCronJob = startCronJob;