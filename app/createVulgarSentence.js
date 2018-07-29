const outbackBlacklistWordsUtil = require('./outbackBlacklistWordsUtil');
const sentenceTemplateUtil      = require('./sentenceTemplateUtil');


module.exports = function createVuldarSentence(_personStrs = []) {
  const personStrs = _personStrs.slice(0);
  const words = outbackBlacklistWordsUtil.getBlacklistWords().slice(0);
  
  // take a random word
  let mainWord;
  if (personStrs.length === 0) {
    mainWord = takeRandom(words);
  }
  else {
    mainWord = takeRandomFilter(words, word =>
      word.useableAsTokenTypes.length > 0
    );
  }
  
  // get sentence templates that are compatible with the word and the given number of people
  const sentenceTemplates = sentenceTemplateUtil.getSentenceTemplates();
  const compatibleSentenceTemplates = sentenceTemplates.filter(sentenceTemplate =>
    getSentenceTemplateIsCompatible(sentenceTemplate, mainWord, personStrs.length)
  );
  
  // choose a random compatible sentence template
  const sentenceTemplate = chooseRandom(compatibleSentenceTemplates);
  if (!sentenceTemplate) {
    // should not happen
    return `*${mainWord.str}*`;
  }
  
  // fill the sentence template
  const tokenStates = getSentenceTemplateReplacements(words, sentenceTemplate, mainWord, personStrs);
  const sentenceStr = sentenceTemplateUtil.buildSentenceStr(sentenceTemplate, tokenStates);
  
  return sentenceStr;
};

function getSentenceTemplateIsCompatible(sentenceTemplate, mainWord, numPeople) {
  // check if the sentence can support the given number of people
  if (!sentenceTemplateUtil.checkRequirements(sentenceTemplate.tokenCategoryRequirementsMap.person, numPeople)) {
    return false;
  }
  
  // check if the sentence can support any of the token types the word can be used as 
  const compatibleAsTokenType = mainWord.useableAsTokenTypes.find(tokenType =>
    sentenceTemplateUtil.checkRequirements(sentenceTemplate.tokenTypeRequirementsMap[tokenType], 1)
  );
  if (!compatibleAsTokenType) {
    return false;
  }
  
  return true;
}

function getSentenceTemplateReplacements(words, sentenceTemplate, mainWord, personStrs) {
  const tokenStates = sentenceTemplateUtil.createTokenStates(sentenceTemplate);
  
  // fill all the person tokens to the min
  tokenStates
  .filter(tokenState => tokenState.token.category === 'person')
  .forEach(tokenState => 
    tokenState.replacements.push(createReplacement(takeRandom(personStrs)))
  );
  
  // add the remaining people randomly into the sentence
  while (personStrs.length > 0) {
    const unfilledPersonTokenStates = tokenStates.filter(tokenState =>
      tokenState.token.category === 'person' &&
      tokenState.replacements.length < tokenState.token.maxNum
    );
    chooseRandom(unfilledPersonTokenStates).replacements.push(createReplacement(takeRandom(personStrs)));
  }
  
  // put the main word randomly into the sentence
  const mainWordCompatibleTokenStates = tokenStates.filter(tokenState =>
    mainWord.useableAsTokenTypes.indexOf(tokenState.token.type) !== -1
  );
  const mainWordTokenState = chooseRandom(mainWordCompatibleTokenStates);
  mainWordTokenState.replacements.push(createWordReplacement(mainWord, `*${mainWord.str}*`));
  
  // fill all the word tokens to the min
  tokenStates
  .filter(tokenState => tokenState.token.category === 'word')
  .forEach(tokenState => {
    for (let i = tokenState.replacements.length; i < tokenState.token.minNum; ++i) {
      const word = takeRandomFilter(words, word =>
        word.useableAsTokenTypes.indexOf(tokenState.token.type) !== -1
      );
      const replacement = word? createWordReplacement(word): createReplacement('!@#$'); // word should always be found
      tokenState.replacements.push(replacement);
    }
  });
  
  // loop through the word tokens that can accept more and randomly add more
  tokenStates.forEach(tokenState => {
    if (tokenState.token.category !== 'word') {
      return;
    }
    
    const maxNum = Math.min(tokenState.token.maxNum, 2); // never have more than 2
    const fillToNum = Math.floor(Math.random() * (maxNum + 1));
    
    for (let i = tokenState.replacements.length; i < fillToNum; ++i) {
      const word = takeRandomFilter(words, word =>
        word.useableAsTokenTypes.indexOf(tokenState.token.type) !== -1
      );
      if (!word) {
        break;
      }
      tokenState.replacements.push(createWordReplacement(word));
    }
  });
  
  // fill the like tokens
  let likeVerbs = [];
  tokenStates
  .filter(tokenState => tokenState.token.category === 'like')
  .forEach(tokenState => {
    if (likeVerbs.length === 0) {
      // refill if depleted
      likeVerbs = sentenceTemplateUtil.getLikeVerbs();
    }
    
    const likeVerb = takeRandom(likeVerbs);
    tokenState.replacements.push(createReplacement(
      tokenState.token.type === '$like'? likeVerb.pluralStr : likeVerb.singularStr
    ));
  });
  
  // fill the think tokens
  let thinkVerbs = [];
  tokenStates
  .filter(tokenState => tokenState.token.category === 'think')
  .forEach(tokenState => {
    if (thinkVerbs.length === 0) {
      // refill if depleted
      thinkVerbs = sentenceTemplateUtil.getThinkVerbs();
    }
    
    const thinkVerb = takeRandom(thinkVerbs);
    tokenState.replacements.push(createReplacement(
      tokenState.token.type === '$think'? thinkVerb.pluralStr : thinkVerb.singularStr
    ));
  });
  
  // fill the other tokens
  let otherNouns = [];
  tokenStates
  .filter(tokenState => tokenState.token.category === 'other')
  .forEach(tokenState => {
    const strKey = tokenState.token.type === '$others' || tokenState.token.type ===  '$othersPos'? 'pluralStr' : 'singularStr';
    
    let otherNoun = takeRandomFilter(otherNouns, otherNoun => otherNoun[strKey]);
    if (!otherNoun) {
      // refill if depleted
      otherNouns = sentenceTemplateUtil.getOtherNouns();
      otherNoun = takeRandomFilter(otherNouns, otherNoun => otherNoun[strKey]);
    }
    
    tokenState.replacements.push(createReplacement(otherNoun[strKey]));
  });
  
  // fill the article tokens
  tokenStates
  .forEach((tokenState, i) => {
    if (tokenState.token.type !== '$article') {
      return;
    }
    
    const nextTokenState = tokenStates
    .slice(i + 1)
    .find(tokenState =>
      tokenState.token.category === 'word' &&
      tokenState.replacements.length > 0
    );
    
    if (!nextTokenState) {
      // should never happen
      tokenState.replacements.push(createReplacement('a'));
      return;
    }
    
    const nextReplacement = nextTokenState.replacements[0];
    if (!nextReplacement || !nextReplacement.word) {
      // should never happen
      tokenState.replacements.push(createReplacement('a'));
      return;
    }
    
    tokenState.replacements.push(createReplacement(
      nextReplacement.word.startsWithVowelSound? 'an' : 'a'
    ));
  });
  
  return tokenStates;
}

function createReplacement(str) {
  return {str};
}
function createWordReplacement(word, str = null) {
  return {
    str: str || word.str,
    word
  };
}

function chooseRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function takeRandom(arr) {
  const i = Math.floor(Math.random() * arr.length);
  const e = arr[i];
  arr.splice(i, 1);
  return e;
}
function takeRandomFilter(arr, filterFn) {
  const e = chooseRandom(arr.filter(filterFn));
  arr.splice(arr.indexOf(e), 1);
  return e;
}