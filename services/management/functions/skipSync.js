const connection = require('../utilities/db').connection;

import { markLeagueNonLegacy } from "../utilities/markLeagueNonLegacy";

export async function skipSync(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;
  const { leagueId } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    await markLeagueNonLegacy(cognitoSub, leagueId);

    callback(null, { message: `LeagueId: ${leagueId} bypassed` });
  } catch (error) {
    console.log(error);
    callback(null, { message: 'ERROR!' });
  }
}