const { fromEvent } = require('graphcool-lib');

async function getUserByDeviceId(api, deviceId) {
  const query = `
    query getUserByDeviceId($deviceId: String!) {
      User(deviceId: $deviceId) {
        id
      }
    }
  `;
  return api.request(query, { deviceId });
}

module.exports = async event => {
  try {
    const graphcool = fromEvent(event);
    const api = graphcool.api('simple/v1');
    const { deviceId } = event.data;
    const userResponse = await getUserByDeviceId(api, deviceId);
    const { User: user } = userResponse;
    if (!user) {
      return { error: 'Invalid deviceId' };
    }
    const token = await graphcool.generateNodeToken(user.id, 'User');
    return { data: { id: user.id, token } };
  } catch (error) {
    console.log(e);
    return { error: 'An unexpected error occured during authentication.' };
  }
};
