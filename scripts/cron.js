const CronJob = require('cron').CronJob;
const update = require('./update-tournament-data');

function startCronJob() {
  const job = new CronJob('0 0 * * * *', function() {
    update();
  });

  job.start();
}

module.exports.startCronJob = startCronJob;