const outbackBlacklistInfos = require('./outbackBlacklistInfos.json');

let _blacklistWords = null;
function getBlacklistWords() {
  if (!_blacklistWords) {
    _blacklistWords = praseBlacklistInfos();
  }
  return _blacklistWords;
}

function praseBlacklistInfos() {
  const words = [];
  
  outbackBlacklistInfos.forEach(blacklistInfo => {
    const [str, desc] = blacklistInfo;
    
    let startsWithVowelSound = false;
    let hasUnknownMeaning = false;
    const useableAsTokenTypes = [];
    
    for (let i = 0; i < desc.length; ++i) {
      const charCode = desc.charCodeAt(i);
      
      if (charCode === 42) { // asterisk (*)
        startsWithVowelSound = true;
      }
      else if (charCode === 63) { // question mark (?)
        hasUnknownMeaning = true;
      }
      else if (charCode === 97 ) useableAsTokenTypes.push('$A'); // a
      else if (charCode === 98 ) useableAsTokenTypes.push('$B'); // b
      else if (charCode === 99 ) useableAsTokenTypes.push('$C'); // c
      else if (charCode === 100) useableAsTokenTypes.push('$D'); // d
      else if (charCode === 101) useableAsTokenTypes.push('$E'); // e
      else if (charCode === 102) useableAsTokenTypes.push('$F'); // f
      else if (charCode === 103) useableAsTokenTypes.push('$G'); // g
      else if (charCode === 104) useableAsTokenTypes.push('$H'); // h
    }
    
    const word = {
      str,
      startsWithVowelSound,
      hasUnknownMeaning,
      useableAsTokenTypes
    };
    words.push(word);
  });
  
  return words;
}

module.exports = {
  getBlacklistWords
};