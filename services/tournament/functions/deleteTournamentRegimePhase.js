const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function deleteTournamentRegimePhase(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  let cognitoSub = event.cognitoPoolClaims.sub;

  const { tournamentRegimeId, tournamentPhaseId } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentRegimeId', mssql.Int, tournamentRegimeId);
    request.input('TournamentPhaseId', mssql.Int, tournamentPhaseId);

    const result = await request.execute('dbo.up_AdminDeleteTournamentRegimePhase');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}