const axios = require('axios');
const { importData } = require('../src/graphcoolClient');

const CLASSIFICATONS = {
  Community: 'COMMUNITY',
  Conservation: 'CONSERVATION',
  'Golf Course': 'GOLF_COURSE',
  Neighborhood: 'NEIGHBORHOOD',
  'Special Facility': 'SPECIAL_FACILITY',
};

const ACTIVITIES_BY_FEATURE_NAME = {
  aquatic_center: ['swimming'],
  baseball_lighted: ['baseball'],
  baseball_unlighted: ['baseball'],
  bmx_track: ['bmx'],
  bocce_ball: ['bocce'],
  croquet: ['croquet'],
  cycling_velodrome: ['cycling'],
  disc_golf: ['disc_golf'],
  equestrian: ['equestrian'],
  fishing_lake: ['fishing'],
  fitness_center: ['fitness'],
  golf_course_18_hole: ['golf'],
  golf_course_9_hole: ['golf'],
  indoor_basketball: ['basketball'],
  indoor_tennis_court: ['tennis'],
  mountain_bike_trail: ['mountain_biking'],
  outdoor_basketball: ['basketball'],
  rugby_field: ['rugby'],
  skate_park: ['skating', 'bmx'],
  soccer_field: ['soccer'],
  stadium: ['football', 'rugby'],
  swimming_pool: ['swimming'],
  tennis_lighted: ['tennis'],
  tennis_unlighted: ['tennis'],
  walking_loop: ['walking', 'running'],
  walking_path_surfaced: ['walking', 'running'],
};

function getParkData() {
  return axios.get('https://data.brla.gov/api/views/phg8-g77c/rows.json');
}

function getField(meta, park, fieldName) {
  const fieldIndex = meta.view.columns.findIndex(c => c.fieldName === fieldName);
  return park[fieldIndex];
}

function getClassifiction(meta, park) {
  const classification = getField(meta, park, 'classification');
  return CLASSIFICATONS[classification];
}

function getActivities(meta, park) {
  return Object.keys(ACTIVITIES_BY_FEATURE_NAME).reduce((activities, featureName) => {
    const count = getField(meta, park, featureName);
    if (!count) {
      return activities;
    }
    ACTIVITIES_BY_FEATURE_NAME[featureName].forEach(activity => {
      if (activities.indexOf(activity) === -1) {
        activities.push(activity);
      }
    });
    return activities;
  }, []);
}

function transformPark(meta, park) {
  const geoLocation = getField(meta, park, 'geolocation');
  return {
    _typeName: 'Park',
    id: getField(meta, park, 'parkid'),
    name: getField(meta, park, 'park_name'),
    classification: getClassifiction(meta, park),
    address: getField(meta, park, 'full_address'),
    city: getField(meta, park, 'city'),
    zipcode: getField(meta, park, 'zip'),
    activities: getActivities(meta, park),
    latitude: parseFloat(geoLocation[1]),
    longitude: parseFloat(geoLocation[2]),
  };
}

function getParks(parkData) {
  const parks = parkData.data.map(p => transformPark(parkData.meta, p));
  // Excluding any parks that are not Geocoded already.
  // TODO: Geocode them automatically
  return parks.filter(p => !isNaN(p.latitude) && p.activities.length > 0);
}

function getParkActivityRelations(parks) {
  return parks.reduce((relations, p) => {
    p.activities.forEach(a => {
      relations.push([
        { _typeName: 'Park', id: p.id, fieldName: 'activities' },
        { _typeName: 'Activity', id: a, fieldName: 'parks' },
      ]);
    });
    return relations;
  }, []);
}

function removeActivities(park) {
  const { activities, ...parkWithoutActivities } = park;
  return parkWithoutActivities;
}

async function importParks() {
  try {
    const parkData = await getParkData();
    const parks = await getParks(parkData);
    const parkActivitiesRelations = await getParkActivityRelations(parks);
    console.log('Seeding parks...');
    const parkResponse = await importData({
      valueType: 'nodes',
      // The `activities` field will throw an error when importing
      values: parks.map(removeActivities),
    });
    console.log(parkResponse);
    console.log();
    console.log('Seeing park activities...');
    const parkActivitiesResponse = await importData({
      valueType: 'relations',
      values: parkActivitiesRelations,
    });
    console.log(parkActivitiesResponse);
  } catch (error) {
    console.error(error);
  }
}

importParks();
