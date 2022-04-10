const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function setTournamentRegimeBracketType(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const { tournamentRegimeId, bracketTypeId } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentRegimeId', mssql.Int, tournamentRegimeId);
    request.input('BracketTypeId', mssql.SmallInt, bracketTypeId)

    const result = await request.execute('dbo.up_AdminSetTournamentRegimeBracketType');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}