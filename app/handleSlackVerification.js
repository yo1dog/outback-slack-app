const urlUtil = require('url');
const https   = require('https');
const config  = require('./config');


module.exports = function handleSlackVerification(event, context, slackParams, slackVerificationCode, cb) {
  exchangeVerificationToken(slackVerificationCode, (err, slackAccessToken) => {
    if (err) return cb(err);
    
    const redirectURL = urlUtil.format({
      protocol: 'https:',
      hostname: 'slack.com',
      pathname: '/app_redirect',
      query: {
        'app': config.slackAppId
      }
    });
    
    return cb(null, {
      statusCode: 302,
      headers: {
        'Location': redirectURL
      },
      body: `Redirecting to ${redirectURL}`
    });
  });
};

function exchangeVerificationToken(slackVerificationCode, cb) {
  const url = urlUtil.format({
    protocol: 'https:',
    hostname: 'slack.com',
    pathname: '/api/oauth.access',
    query: {
      client_id    : config.slackAppClientId,
      client_secret: config.slackAppClientSecret,
      code         : slackVerificationCode,
      redirect_uri : ''
    }
  });
  
  const req = https.get(url, res => {
    let bodyStr = '';
    res.on('data', (chunk) => {
      bodyStr += chunk;
    });
    res.on('end', () => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return cb(new Error(`OAuth2 access response status code is not 2XX (${res.statusCode}):\n${bodyStr}`));
      }
      
      let body;
      try {
        body = JSON.parse(bodyStr);
      } catch(err) {
        return cb(new Error(`OAuth2 access response body is not valid JSON: ${err.message}:\n${bodyStr}`));
      }
      
      if (!body.ok) {
        return cb(new Error(`OAuth2 access response body is not "ok":\n${JSON.stringify(body, null, 2)}`));
      }
      
      const slackAccessToken = body.access_token;
      if (!slackAccessToken) {
        return cb(new Error(`OAuth2 access response body does not contain the access token:\n${JSON.stringify(body, null, 2)}`));
      }
      
      return cb(null, slackAccessToken);
    });
  });
  
  req.on('error', err => {
    return cb(new Error(`Error requesting OAuth2 access: ${err.message}`));
  });
  req.end();
}