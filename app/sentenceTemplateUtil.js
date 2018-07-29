/*
bob is a {A}
bob enjoys a {B}
bob is {C} ("can be descibed as", no action/verbs)
bob enjoys {D}
bob is a {E} butthead
bob's {F}
bob and sal's {G}
bob and sal are {H} (can be descibed as, no action/verbs)
{I} enjoys icecream
{J} enjoy icecream
*/

const sentenceTemplateStrs = [
  '$person is $article $E* $A',
  '$person $likes $article $E* $B',
  '$person is $E* $C',
  '$person $likes $E* $D',
  '$person $likes $personPos $E* $F',
  '$person $likes $personPos{2,} $E* $G',
  '$person $likes their $E* $F',
  '$person{2,} $like $article $E* $B',
  '$person{2,} are $E* $H',
  '$person{2,} $like $E* $D',
  '$person{2,} $like $personPos $E* $F',
  '$person{2,} $like $personPos{2,} $E* $G',
  '$person{2,} have $E* $G',
  '$person{2,} $like their $E* $G',
];

const likeVerbs = [
  {singularStr: 'likes',                pluralStr: 'like'    },
  {singularStr: 'enjoys',               pluralStr: 'enjoy'   },
  {singularStr: 'loves',                pluralStr: 'love'    },
  {singularStr: 'craves',               pluralStr: 'crave'   },
  {singularStr: 'longs for',            pluralStr: 'long for'},
  {singularStr: 'adores',               pluralStr: 'adore'   },
  {singularStr: 'can\'t get enough of', pluralStr: 'can\'t get enough of'},
  {singularStr: 'dreams of',            pluralStr: 'dream of'},
  {singularStr: 'drolls over',          pluralStr: 'droll over'},
  {singularStr: 'worships',             pluralStr: 'worship'},
  {singularStr: 'cherishes',            pluralStr: 'cherish'},
  {singularStr: 'hates',                pluralStr: 'hate'},
  {singularStr: 'despises',             pluralStr: 'despise'},
  {singularStr: 'detests',              pluralStr: 'detest'},
  {singularStr: 'is discusted by',      pluralStr: 'are discusted by'},
];
const thinkVerbs = [
  {singularStr: 'thinks',              pluralStr: 'think'              },
  {singularStr: 'knows',               pluralStr: 'know'               },
  {singularStr: 'secretly thinks',     pluralStr: 'secretly think'     },
  {singularStr: 'obviously thinks',    pluralStr: 'obviously think'    },
  {singularStr: 'notices that',        pluralStr: 'notice that'        },
  {singularStr: 'recognizes that',     pluralStr: 'recognize that'     },
  {singularStr: 'guesses',             pluralStr: 'guess'              },
  {singularStr: 'realizes',            pluralStr: 'realize'            },
  {singularStr: 'understands that',    pluralStr: 'understand that'    },
  {singularStr: 'wonders if',          pluralStr: 'wonder if'          },
  {singularStr: 'accepts that',        pluralStr: 'accept that'        },
  {singularStr: 'found out that',      pluralStr: 'found out that'     },
  {singularStr: 'discovered',          pluralStr: 'discovered'         },
  {singularStr: 'knew all along that', pluralStr: 'knew all along that'},
  {singularStr: 'believes',            pluralStr: 'believe'            }
];
const otherNouns = [
  {singularStr: 'the boss', pluralStr: 'the bosses'},
  {singularStr: 'the president'},
  {singularStr: 'HR'},
  {singularStr: 'everyone'},
  {pluralStr: 'people'},
  {singularStr: 'someone'},
  {singularStr: 'the neighbor', pluralStr: 'the neighbors'},
  {singularStr: 'the janitor', pluralStr: 'the janitors'},
  {singularStr: 'the tech team'},
  {singularStr: 'the sales team'},
  {singularStr: 'the team lead', pluralStr: 'the team leads'},
  {pluralStr: 'the founders'},
  {pluralStr: 'the boys'},
  {pluralStr: 'the girls'},
];

const tokenTypeCategoryMap = {
  $A        : 'word',
  $B        : 'word',
  $C        : 'word',
  $D        : 'word',
  $E        : 'word',
  $F        : 'word',
  $G        : 'word',
  $H        : 'word',
  $person   : 'person',
  $personPos: 'person',
  $article  : 'article',
  $like     : 'like',
  $likes    : 'like',
  $think    : 'think',
  $thinks   : 'think',
  $other    : 'other',
  $otherPos : 'other',
  $others   : 'other',
  $othersPos: 'other',
  $const    : 'const'
};

// create copies of the templates that start with think tokens
sentenceTemplateStrs.forEach(templateStrs => {
  sentenceTemplateStrs.push(`$person $thinks ${templateStrs}`);
  sentenceTemplateStrs.push(`$person{2,} $think ${templateStrs}`);
});

// create copies of the templates with every permutation of person tokens replaced with other tokens
sentenceTemplateStrs.forEach(templateStr => {
  const parts = [];
  const personTokenStrs = [];
  const otherTokenStrs  = [];
  
  const regex = /\$person(Pos)?(\{2,\})?/g;
  let match;
  let lastMatchEndIndex = 0;
  while ((match = regex.exec(templateStr))) {
    personTokenStrs.push(match[0]);
    
    let otherTokenStr = '$other';
    if (match[2])  {
      otherTokenStr += 's';
    }
    if (match[1]) {
      otherTokenStr += 'Pos';
    }
    otherTokenStrs.push(otherTokenStr);
    
    parts.push(templateStr.substring(lastMatchEndIndex, match.index));
    lastMatchEndIndex = match.index + match[0].length;
  }
  parts.push(templateStr.substring(lastMatchEndIndex));
  
  const basePerm = {
    parts,
    tokenStrs: personTokenStrs.slice(0)
  };
  
  const perms = [basePerm];
  personTokenStrs.forEach((personTokenStr, index) => {
    const otherTokenStr = otherTokenStrs[index];
    
    perms.forEach(perm => {
      const newPerm = {
        parts    : perm.parts,
        tokenStrs: perm.tokenStrs.slice(0)
      };
      newPerm.tokenStrs[index] = otherTokenStr;
      
      perms.push(newPerm);
    });
  });
  
  // skip the first one as it is the base one and is already in the list
  for (let i = 1; i < perms.length; ++i) {
    const perm = perms[i];
    
    let templateStr = perm.parts[0];
    for (let j = 0; j < perm.tokenStrs.length; ++j) {
      templateStr += perm.tokenStrs[j] + perm.parts[j + 1];
    }
    
    sentenceTemplateStrs.push(templateStr);
  }
});

// add simple templates
sentenceTemplateStrs.push('$E* $A');
sentenceTemplateStrs.push('$E* $B');
sentenceTemplateStrs.push('$E* $C');
sentenceTemplateStrs.push('$E* $D');
sentenceTemplateStrs.push('$E* $F');
sentenceTemplateStrs.push('$E* $G');
sentenceTemplateStrs.push('$E* $H');


function parseTemplateStrs(templateStrs) {
  return templateStrs
  .map(templateStr => parseTemplateStr(templateStr))
  // remove templates that have 3 or more groups of people
  .filter(template =>
    template.tokens.filter(token => token.category === 'person' && token.maxNum > 1).length < 3
  );
}
function parseTemplateStr(templateStr) {
  const tokens = [];
  const tokenTypeRequirementsMap = {};
  const tokenCategoryRequirementsMap = {};
  
  const regex = /(\$[a-z]+)(\?|\*|\+|({(\d+)(,(\d*))?}))?/ig;
  let match;
  let lastMatchEndIndex = 0;
  while ((match = regex.exec(templateStr))) {
    tokens.push(createConstToken(
      templateStr.substring(lastMatchEndIndex, match.index)
    ));
    
    const type               = match[1];
    const mod                = match[2];
    const intervalExpression = match[3];
    const intervalMStr       = match[4];
    const intervalNGroupStr  = match[5];
    const intervalNStr       = match[6];
    
    const category = tokenTypeCategoryMap[type];
    if (!category) {
      throw new Error(`Unrecognized token '${match[0]}' at index ${match.index} in sentence templste: '${templateStr}'.`);
    }
    
    let minNum = 1;
    let maxNum = 1;
    if (intervalExpression) {
      minNum = parseInt(intervalMStr, 10);
      
      if (intervalNGroupStr) {
        if (intervalNStr) {
          maxNum = parseInt(intervalNStr, 10);
        }
        else {
          maxNum = Number.POSITIVE_INFINITY;
        }
      }
      else {
        maxNum = minNum;
      }
    }
    else if (mod === '?') {
      minNum = 0;
      maxNum = 1;
    }
    else if (mod === '*') {
      minNum = 0;
      maxNum = Number.POSITIVE_INFINITY;
    }
    else if (mod === '+') {
      minNum = 1;
      maxNum = Number.POSITIVE_INFINITY;
    }
    
    const isPossesive = /Pos$/.test(type);
    
    tokens.push({
      type,
      category,
      minNum,
      maxNum,
      isPossesive
    });
    
    tokenTypeRequirementsMap[type] = tokenTypeRequirementsMap[type] || {minNum: 0, maxNum: 0};
    tokenTypeRequirementsMap[type].minNum += minNum;
    tokenTypeRequirementsMap[type].maxNum += maxNum;
    
    tokenCategoryRequirementsMap[category] = tokenCategoryRequirementsMap[category] || {minNum: 0, maxNum: 0};
    tokenCategoryRequirementsMap[category].minNum += minNum;
    tokenCategoryRequirementsMap[category].maxNum += maxNum;
    
    lastMatchEndIndex = match.index + match[0].length;
  }
  
  tokens.push(createConstToken(
    templateStr.substring(lastMatchEndIndex)
  ));
  
  return {
    templateStr,
    tokens,
    tokenTypeRequirementsMap,
    tokenCategoryRequirementsMap
  };
}

function createConstToken(str) {
  return {
    type    : '$const',
    category: 'const',
    str
  };
}

function buildSentenceStr(sentenceTemplate, tokenStates) {
  let sentenceStr = '';
  
  sentenceTemplate.tokens.forEach((token, i) => {
    const tokenState = tokenStates[i];
    
    if (tokenState.token !== token) {
      throw new Error(`Token states are mangled. Token state at index ${i} does not belong to correct token.`);
    }
    
    if (token.type === '$const') {
      let str = token.str;
      
      // don't duplicate whitespace in constants
      if (
        str[0] === ' ' && (
          sentenceStr.length === 0 ||
          sentenceStr[sentenceStr.length - 1] === ' '
        )
      ) {
        str = str.substring(1);
      }
      
      sentenceStr += str;
      return;
    }
    
    const replacements = tokenState.replacements;
    if (replacements.length < token.minNum) {
      throw new Error(`Token state at index ${i} does not have enough replacements. Has ${replacements.length}, requires at least ${token.minNum}.`);
    }
    if (replacements.length > token.maxNum) {
      throw new Error(`Token state at index ${i} has too many replacements. Has ${replacements.length}, requires no more than ${token.minNum}.`);
    }
    
    if (replacements.length === 0) {
      return;
    }
    
    let str = '';
    
    const beginingReplacements = replacements.length === 1? [] : replacements.slice(0, -1);
    const lastReplacement = replacements[replacements.length - 1];
    
    let seperatorStr;
    if (replacements.length < 3) {
      seperatorStr = ' ';
    }
    else if (token.category === 'person') {
      seperatorStr = ', ';
    }
    else {
      seperatorStr = ' ';
    }
    beginingReplacements.forEach(replacement => {
      str += replacement.str + seperatorStr;
    });
    
    if (replacements.length > 1) {
      if (token.category === 'person') {
        str += 'and ';
      }
    }
    
    str += lastReplacement.str;
    
    if (token.isPossesive) {
      const lastChar = str[str.length - 1];
      str += lastChar === 's' || lastChar === 'S'? '\'' : '\'s';
    }
    
    // capitalize the first letter
    if (
      sentenceStr.length === 0 &&
      token.category !== 'word' &&
      token.category !== 'person' &&
      str.length > 0
    ) {
      str = str[0].toUpperCase() + str.substring(1);
    }
    
    sentenceStr += str;
  });
  
  return sentenceStr;
}

let _sentenceTemplates = null;
function getSentenceTemplates() {
  if (!_sentenceTemplates) {
    _sentenceTemplates = parseTemplateStrs(sentenceTemplateStrs);
  }
  return _sentenceTemplates;
}

function createTokenStates(sentenceTemplate) {
  const tokenStates = sentenceTemplate.tokens.map(token => ({
    token,
    replacements: []
  }));
  return tokenStates;
}

function checkRequirements(requirements, num) {
  let minNum = requirements? requirements.minNum : 0;
  let maxNum = requirements? requirements.maxNum : 0;
  
  return num >= minNum && num <= maxNum;
}

function getLikeVerbs() {
  return likeVerbs.slice(0);
}
function getThinkVerbs() {
  return thinkVerbs.slice(0);
}
function getOtherNouns() {
  return otherNouns.slice(0);
}

module.exports = {
  getSentenceTemplates,
  createTokenStates,
  checkRequirements,
  buildSentenceStr,
  getLikeVerbs,
  getThinkVerbs,
  getOtherNouns
};