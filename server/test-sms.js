const { sendSms } = require('./services/sms');

sendSms(['+254750671202'], 'Test: Sauti Kweli sandbox working')
  .then(console.log)
  .catch(console.error);