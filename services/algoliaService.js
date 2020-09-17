const agoliasearch = require('algoliasearch');
const _ = require('lodash');

const {
    ALGOLIA_APP_ID,
    ALGOLIA_API_KEY,
} = require('../environment/environment');

let client = null;
let index = null;

const updateIndex = (indexName, objects) => {
    if (!client) {
        client = agoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
    }
    index = client.initIndex(indexName);

    objects.forEach((object) => {
        object.objectID = object._id;
        delete object['_id'];
    });

    const chunks = _.chunk(objects, 1000);
    chunks.forEach((chunk) => index.saveObjects(chunk));
};

module.exports = {
    updateIndex
};
