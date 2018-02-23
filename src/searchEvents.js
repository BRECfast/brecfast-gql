const algoliasearch = require('algoliasearch');

function getIndex() {
  const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
  return client.initIndex(process.env.ALGOLIA_INDEX_NAME);
}

function transformHit(geoSearch, hit) {
  const {
    objectID,
    _geoloc,
    _highlightResult,
    _rankingInfo,
    _participationsMeta,
    activity,
    park,
    owner,
    time,
    createdAt,
    updatedAt,
    ...eventResult
  } = hit;
  eventResult.time = new Date(time).toISOString();
  eventResult.createdAt = new Date(createdAt).toISOString();
  eventResult.updatedAt = new Date(createdAt).toISOString();
  eventResult.activityId = activity.id;
  eventResult.activityName = activity.name;
  eventResult.parkId = park.id;
  eventResult.parkName = park.name;
  eventResult.address = park.address;
  eventResult.city = park.city;
  eventResult.zipcode = park.zipcode;
  eventResult.latitude = park.latitude;
  eventResult.longitude = park.longitude;
  eventResult.participantsCount = _participationsMeta.count;
  if (eventResult.owner) {
    eventResult.ownerId = owner.id;
    eventResult.ownerName = owner.name;
    eventResult.ownerEmail = owner.email;
  }
  if (geoSearch) {
    eventResult._geoDistance = hit._rankingInfo.geoDistance;
  }
  return eventResult;
}

function buildQueryParams({
  query,
  latitude,
  longitude,
  time_gte,
  time_lte,
  activityId_in,
  status_in,
}) {
  const params = {
    getRankingInfo: true,
  };
  if (query) {
    params.query = query;
  }
  if (latitude && longitude) {
    params.aroundLatLng = `${latitude},${longitude}`;
  }

  if (time_gte) {
    if (time_lte) {
      params.filters = `time:${Date.parse(time_gte)} TO ${Date.parse(time_lte)}`;
    } else {
      params.filters = `time >= ${Date.parse(time_gte)}`;
    }
  } else if (time_lte) {
    params.filters = `time <= ${Date.parse(time_lte)}`;
  }

  let facetFilters = [];
  if (activityId_in) {
    facetFilters.push(activityId_in.map(id => `activity.id:${id}`));
  }
  if (status_in) {
    facetFilters.push(status_in.map(status => `status:${status}`));
  }
  if (facetFilters.length > 0) {
    params.facetFilters = facetFilters;
  }
  return params;
}

module.exports = async event => {
  try {
    const params = buildQueryParams(event.data || {});
    console.log(params);
    const response = await getIndex().search(params);
    return {
      data: response.hits.map(hit => transformHit(params.aroundLatLng != null, hit)),
    };
  } catch (error) {
    console.log(error);
    return {
      error: 'Could not search because of an error.',
    };
  }
};
