import { populateTournamentRegimeTVP } from '../common';

const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function newTournamentRegime(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const { tournamentId, regimes } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);

    if (regimes.length > 0) {
      const tvp = populateTournamentRegimeTVP(tournamentId, regimes);

      request.input('TournamentRegimes', tvp);
    }

    const result = await request.execute('dbo.up_AdminNewTournamentRegime');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}