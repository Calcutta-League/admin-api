const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function setTournamentRegimeDisabledFlag(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const { tournamentRegimeId, disabledFlag } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentRegimeId', mssql.Int, tournamentRegimeId);
    request.input('IsInvalidated', mssql.Bit, disabledFlag);

    const result = await request.execute('dbo.up_AdminUpdateTournamentRegimeInvalidatedDate');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}