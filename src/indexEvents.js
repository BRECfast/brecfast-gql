const algoliasearch = require('algoliasearch');

const MODEL_NAME = 'Event';

function getIndex() {
  const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
  return client.initIndex(process.env.ALGOLIA_INDEX_NAME);
}

function transformNode(node) {
  return {
    ...node,
    objectID: node.id,
    _geoloc: {
      lat: node.park.latitude,
      lng: node.park.longitude,
    },
  };
}

function syncSavedNode(node) {
  console.log(`Saving node '${node.id}'`);
  return getIndex().saveObject(transformNode(node));
}

function syncDeletedNode(previousValues) {
  console.log(`Deleting node '${previousValues.id}'`);
  return getIndex().deleteObject(previousValues.id);
}

module.exports = event => {
  const { mutation, node, previousValues } = event.data[MODEL_NAME];
  if (mutation === 'DELETED') {
    return syncDeletedNode(previousValues);
  } else {
    return syncSavedNode(node);
  }
};
