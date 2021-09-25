const connection = require('../../../utilities/db').connection;
const mssql = require('mssql');

export async function getSportOptions(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  console.log(event);

  let cognitoSub = event.cognitoPoolClaims.sub;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);

    let result = await request.execute('dbo.up_AdminGetActiveSports');
    console.log(result);

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
  }
}