const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function getTournamentRegimes(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  let cognitoSub = event.cognitoPoolClaims.sub;

  let tournamentId = event.path.tournamentId;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentId', mssql.SmallInt, tournamentId);

    let result = await request.execute('dbo.up_AdminGetTournamentRegimes');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}