const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function getTeamsBySportId(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const sportId = event.path.sportId;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('SportId', mssql.Int, sportId);

    let result = await request.execute('dbo.up_AdminGetTeamsBySportId');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}