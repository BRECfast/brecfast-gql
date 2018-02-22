const { query } = require('../src/graphcoolClient');

async function touchParktoTriggerIndexing(park) {
  return query({
    query: `
      mutation updatePark($id: ID!, $name: String!) {
        updatePark(id: $id, name: $name) {
          id
          name
        }
      }
    `,
    variables: {
      id: park.id,
      name: park.name,
    },
  });
}

async function touchAllParksToTriggerIndexing() {
  try {
    const allParksResponse = await query({
      query: `
      query {
        allParks {
          id
          name
        }
      }
    `,
    });
    await Promise.all(allParksResponse.data.allParks.map(touchParktoTriggerIndexing));
  } catch (error) {
    console.log(error);
  }
}

touchAllParksToTriggerIndexing();
