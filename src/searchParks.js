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
    createdAt,
    updatedAt,
    ...parkResult
  } = hit;
  parkResult.createdAt = new Date(createdAt).toISOString();
  parkResult.updatedAt = new Date(createdAt).toISOString();
  if (geoSearch) {
    parkResult._geoDistance = hit._rankingInfo.geoDistance;
  }
  return parkResult;
}

function buildQueryParams({
  query,
  latitude,
  longitude,
  activitiesIds_contain_all,
  activitiesIds_contain_some,
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

  if (activitiesIds_contain_all) {
    params.facetFilters = activitiesIds_contain_all.map(id => `activities.id:${id}`);
  } else if (activitiesIds_contain_some) {
    params.facetFilters = [activitiesIds_contain_some.map(id => `activities.id:${id}`)];
  }
  return params;
}

module.exports = async event => {
  try {
    const params = buildQueryParams(event.data || {});
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
