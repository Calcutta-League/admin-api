const connection = require('../../../utilities/db').connection;
const mssql = require('mssql');

export async function getGamesMetadata(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  console.log(event);

  let cognitoSub = event.cognitoPoolClaims.sub;
  let sportId = +event.path.sportId;
  let dateString = event.path.date;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('SportId', mssql.Int(), sportId);
    request.input('Date', mssql.VarChar(), dateString);

    let result = await request.execute('dbo.up_AdminGetGamesMetadata');
    console.log(result);

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
  }
}