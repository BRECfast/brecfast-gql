const algoliasearch = require('algoliasearch');

function getIndex() {
  const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
  return client.initIndex(process.env.ALGOLIA_INDEX_NAME);
}

function transformHit(geoSearch, hit) {
  const { _geoloc, _highlightResult, _rankingInfo, ...parkResult } = hit;
  if (geoSearch) {
    parkResult._geoDistance = hit._rankingInfo.geoDistance;
  }
  return parkResult;
}

function buildQueryParams({ query, latitude, longitude, allActivitiesIds, someActivitiesIds }) {
  const params = {
    getRankingInfo: true,
  };
  if (query) {
    params.query = query;
  }
  if (latitude && longitude) {
    params.aroundLatLng = `${latitude},${longitude}`;
  }
  if (allActivitiesIds) {
    params.facetFilters = allActivitiesIds.map(id => `activities.id:${id}`);
  }
  if (someActivitiesIds) {
    params.facetFilters = [someActivitiesIds.map(id => `activities.id:${id}`)];
  }
  return params;
}

module.exports = async event => {
  try {
    const params = buildQueryParams(event.data || {});
    const response = await getIndex().search(params);
    return {
      data: response.hits.map(h => transformHit(params.aroundLatLng != null, h)),
    };
  } catch (error) {
    console.log(error);
    return {
      error: 'Uhoh',
    };
  }
};
