const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function getPayoutSettings(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const tournamentRegimeId = event.path.tournamentRegimeId;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentRegimeId', mssql.Int, tournamentRegimeId);

    const result = await request.execute('dbo.up_AdminGetTournamentPayouts');

    const payload = {
      payouts: result.recordsets[0],
      phases: result.recordsets[1],
      payoutTypes: result.recordsets[2]
    };

    callback(null, payload);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}