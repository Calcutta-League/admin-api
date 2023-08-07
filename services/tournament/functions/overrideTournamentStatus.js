import { populateTournamentIdTVP } from '../common';

const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function overrideTournamentStatus(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const { tournamentIds } = event.body;

  if (tournamentIds?.length <= 0) {
    callback(null, { message: 'No tournamentIds supplied!' });
  }

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();
    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);

    const tvp = populateTournamentIdTVP(tournamentIds);
    request.input('TournamentIds', tvp);

    const result = await request.execute('dbo.up_AdminOverrideTournamentStatus');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}