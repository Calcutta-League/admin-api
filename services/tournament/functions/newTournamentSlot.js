const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function newTournamentSlot(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const { tournamentRegimeId, seed, name, teamId } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentRegimeId', mssql.Int, tournamentRegimeId);
    request.input('Seed', mssql.TinyInt, seed);
    request.input('TournamentSlotName', mssql.VarChar(100), name);
    request.input('TeamId', mssql.BigInt, teamId);

    const result = await request.execute('dbo.up_AdminNewTournamentSlot');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}