const { importData } = require('../src/graphcoolClient');
const activities = require('../seeds/activities.json');

const activitiesNdl = {
  valueType: 'nodes',
  values: activities.data.map(a => ({ ...a, _typeName: 'Activity' })),
};

importData(activitiesNdl)
  .then(d => console.log(d))
  .catch(e => console.error(e));
