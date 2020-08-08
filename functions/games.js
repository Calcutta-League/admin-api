const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function getGamesBySportId(event, context, callback) {
  context.callbackWaitsForEmptyEventLoopFalse = false;

  console.log(event);

  let cognitoSub = event.cognitoPoolClaims.sub;
  let sportId = +event.path.sportId;
  let dateString = event.path.date;
  let offset = +event.path.offset || undefined;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('SportId', mssql.Int(), sportId);
    request.input('Date', mssql.VarChar(), dateString);

    if (offset !== undefined) {
      request.input('Offset', mssql.Int(), offset);
    }

    let result = await request.execute('dbo.up_AdminGetGamesBySportId');
    console.log(result);

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
  }
}
