const mssql = require('mssql');
const connection = require('../utilities/db').connection;

export async function getLegacyLeagues(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();
    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    
    const result = request.execute('dbo.up_AdminGetLegacyLeagues');
    console.log(result);

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);

    callback(null, { error: error });
  }
}