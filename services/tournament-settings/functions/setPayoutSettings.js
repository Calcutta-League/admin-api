import { populateTournamentPayoutTypeTVP } from '../common';

const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function setPayoutSettings(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const { payouts } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);

    if (payouts.length >= 1) {
      const tvp = populateTournamentPayoutTypeTVP(payouts);

      request.input('TournamentPayouts', tvp);
    }

    const result = request.execute('dbo.up_AdminSetTournamentPayouts');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}