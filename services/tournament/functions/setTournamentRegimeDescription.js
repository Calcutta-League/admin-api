const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function setTournamentRegimeDescription(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const { tournamentRegimeId, description } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentRegimeId', mssql.Int, tournamentRegimeId);
    request.input('RegimeDescription', mssql.VarChar(500), description)

    const result = await request.execute('dbo.up_AdminSetTournamentRegimeDescription');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}