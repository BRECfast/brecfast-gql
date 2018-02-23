const algoliasearch = require('algoliasearch');

const MODEL_NAME = 'Event';

function getIndex() {
  const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
  return client.initIndex(process.env.ALGOLIA_INDEX_NAME);
}

function transformNode(node) {
  const toIndex = {
    ...node,
    objectID: node.id,
    time: Date.parse(node.time),
    createdAt: Date.parse(node.createdAt),
    updatedAt: Date.parse(node.updatedAt),
    _geoloc: {
      lat: node.park.latitude,
      lng: node.park.longitude,
    },
  };
  const owner = node.participations.find(p => p.role === 'OWNER');
  if (owner) {
    toIndex.owner = owner.user;
  }
  return toIndex;
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
