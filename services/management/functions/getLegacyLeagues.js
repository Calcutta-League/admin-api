import { fetchLegacyLeagues } from '../utilities/fetchLegacyLeagues';

const mssql = require('mssql');
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