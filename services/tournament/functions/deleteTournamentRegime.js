const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function deleteTournamentRegime(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  let cognitoSub = event.cognitoPoolClaims.sub;

  const { tournamentRegimeId } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentRegimeId', mssql.Int, tournamentRegimeId);

    const result = await request.execute('dbo.up_AdminDeleteTournamentRegime');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}