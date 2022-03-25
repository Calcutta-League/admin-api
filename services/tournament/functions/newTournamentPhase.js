import { populateTournamentPhasesTVP } from '../common';

const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function newTournamentPhase(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const { tournamentId, phases } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentId', mssql.SmallInt, tournamentId);

    if (phases.length > 0) {
      const tvp = populateTournamentPhasesTVP(phases);

      request.input('TournamentPhases', tvp);
    }

    const result = await request.execute('dbo.up_AdminNewTournamentPhase');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}