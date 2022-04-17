const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export function deletePayoutSettings(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const { payoutId } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentPayoutId', mssql.BigInt, payoutId);

    const result = request.execute('dbo.up_AdminDeleteTournamentPayout');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}