const { searchTrustedSources } = require('./tavily');

searchTrustedSources('cholera outbreak reported in Kenya')
  .then(results => console.log(JSON.stringify(results, null, 2)))
  .catch(console.error);