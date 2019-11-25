const api = require('./packages/featurebook-api/lib/featurebook-api');
const path = require('path');

api.readSpecTree('./packages/featurebook-api/test/resources/dir-walker/', (err, ret) => {
    console.log(err, ret);
});

