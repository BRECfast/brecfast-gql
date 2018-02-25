const axios = require('axios');

// TODO: Use graphcool conventions to automatically find this data
const SERVICE_URL = process.env.GRAPHCOOL_SERVICE_URL;
const AUTH_TOKEN = process.env.GRAPHCOOL_AUTH_TOKEN;

function importData(data) {
  return axios
    .post(`${SERVICE_URL}/import`, data, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    })
    .then(r => r.data);
}

function query(data) {
  return axios
    .post(SERVICE_URL, data, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    })
    .then(r => r.data);
}

module.exports = { importData, query };
