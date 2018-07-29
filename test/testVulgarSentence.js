const createVulgarSentence = require('../app/createVulgarSentence');
const peopleStrs = ['Mike', 'Bob', 'Sal'];

for (let i = 0; i < 100; ++i) {
  const startIndex = Math.floor(Math.random() * peopleStrs.length);
  const endIndex = startIndex + Math.floor(Math.random() * ((peopleStrs.length - startIndex) + 1));
  console.log(createVulgarSentence(peopleStrs.slice(startIndex, endIndex)));
}