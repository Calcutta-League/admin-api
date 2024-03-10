const connection = require('../utilities/db').connection;
import mssql from 'mssql';

export async function pullLeaguesForTournamentRegime(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const { tournamentRegimeId, cognitoSub } = event;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();
    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentRegimeId', mssql.Int, tournamentRegimeId);

    const result = await request.execute('dbo.up_AdminGetLeaguesForTournamentRegime');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}