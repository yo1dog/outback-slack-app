const createVulgarSentence = require('./createVulgarSentence');


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
    // get the mentioned users
    const regex = /<@(U[A-Z0-9]+)[|>]/gi;
    let match;
    let userMentionStrs = [];
    while ((match = regex.exec(inputText))) {
      const slackUserId = match[1];
      userMentionStrs.push(`<@${slackUserId}>`);
    }
    
    // check if there is a multiplier
    let numSentences = 1;
    match = /\bx?(\d+)\b/i.exec(inputText);
    if (match) {
      numSentences = parseInt(match[1], 10);
    }
    
    // create setences
    const sentenceStrs = [];
    for (let i = 0; i < numSentences; ++i) {
      const sentenceStr = createVulgarSentence(userMentionStrs);
      sentenceStrs.push(sentenceStr);
    }
    
    res = {
      text: sentenceStrs.join('\n'),
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