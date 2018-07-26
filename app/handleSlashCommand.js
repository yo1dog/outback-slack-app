const outbackBlacklist = require('./outbackBlacklist.json');


module.exports = function handleSlashCommand(event, context, slackParams, slashCommand, cb) {
  const inputText = (slackParams.text || '').trim();
  
  let res;
  if (inputText === 'help') {
    res = {
      text: 'https://www.reddit.com/r/webdev/comments/91mi29/the_source_over_at_outback_steakhouse_is_mighty/',
      response_type: 'in_channel',
    };
  }
  else {
    // choose a random naughty word from the blacklist
    const naughtyWord = outbackBlacklist[
      Math.floor(Math.random() * outbackBlacklist.length)
    ];
    
    // check if someone was mentioned
    const match = /<@(U[a-zA-Z0-9]+)[|>]/.exec(inputText);
    const slackUserId = match && match[1];
    
    res = {
      text: slackUserId? `<@${slackUserId}> is a ${naughtyWord}` : naughtyWord,
      response_type: 'in_channel',
      mrkdwn: false
    };
  }
  
  return cb(null, {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(res)
  });
};