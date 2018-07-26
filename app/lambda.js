process.on('unhandledRejection', err => {
  throw err;
});

const querystring             = require('querystring');
const handleSlashCommand      = require('./handleSlashCommand');
const handleSlackVerification = require('./handleSlackVerification');


function handler(event, context, cb) {
  // Lambda entry point
  // get and parse the Slack params from the request body (should be x-www-form-urlencoded)
  const slackParams = querystring.parse(event.body);
  
  // determine how to handle the request
  // if there is a command Slack param, the request is a slash command
  const slashCommand = slackParams.command;
  if (slashCommand) {
    return handleSlashCommand(event, context, slackParams, slashCommand, cb);
  }
  
  // if there is a verification code query string param, the request is a verification
  const queryStringParams = event.queryStringParameters || {};
  const slackVerificationCode = queryStringParams.code;
  if (slackVerificationCode) {
    return handleSlackVerification(event, context, slackParams, slackVerificationCode, cb);
  }
  
  return cb(new Error(`Unable to determine how to handle Slack request.`));
}


module.exports = {
  handler
};