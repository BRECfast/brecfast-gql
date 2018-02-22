const axios = require('axios');

// TODO: Use graphcool conventions to automatically find this data
const SERVICE_ID = process.env.GRAPHCOOL_SERVICE_ID;
const AUTH_TOKEN = process.env.GRAPHCOOL_AUTH_TOKEN;

function importData(data) {
  return axios
    .post(`https://api.graph.cool/simple/v1/${SERVICE_ID}/import`, data, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    })
    .then(r => r.data);
}

function query(data) {
  return axios
    .post(`https://api.graph.cool/simple/v1/${SERVICE_ID}`, data, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    })
    .then(r => r.data);
}

module.exports = { importData, query };
