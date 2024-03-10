const connection = require('../utilities/db').connection;
import mssql from 'mssql';

export async function pullLeagueSlots(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const { leagueId, cognitoSub } = event;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();
    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('LeagueId', mssql.Int, leagueId);

    const result = await request.execute('dbo.up_AdminGetLeagueSlots');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}