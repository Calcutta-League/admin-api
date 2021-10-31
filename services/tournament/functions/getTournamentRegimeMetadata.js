const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function getTournamentRegimeMetadata(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  let cognitoSub = event.cognitoPoolClaims.sub;

  let tournamentRegimeId = event.path.tournamentRegimeId;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentRegimeId', mssql.Int, tournamentRegimeId);

    let result = await request.execute('dbo.up_AdminGetTournamentRegimeMetadata');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}