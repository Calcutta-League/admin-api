import { fetchLegacyLeagues } from '../utilities/fetchLegacyLeagues';

const connection = require('../utilities/db').connection;

export async function getLegacyLeagues(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const leagues = await fetchLegacyLeagues(cognitoSub);

    callback(null, leagues);
  } catch (error) {
    console.log(error);

    callback(null, { error: error });
  }
}

export async function getLegacyLeaguesInvokable(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const { cognitoSub, numLeagues } = event;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const leagues = await fetchLegacyLeagues(cognitoSub, numLeagues || 10);

    callback(null, leagues);
  } catch (error) {
    console.log(error);

    callback(null, { error: error });
  }
}