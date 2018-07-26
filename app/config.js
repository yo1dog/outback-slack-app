/* eslint-disable no-process-env */
module.exports = {
  slackAppId          : (process.env.SLACK_APP_ID            || '').trim(),
  slackAppClientId    : (process.env.SLACK_APP_CLIENT_ID     || '').trim(),
  slackAppClientSecret: (process.env.SLACK_APP_CLIENT_SECRET || '').trim()
};