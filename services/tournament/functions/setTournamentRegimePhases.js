const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function setTournamentRegimePhases(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const { tournamentRegimeId, phases } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentRegimeId', mssql.Int, tournamentRegimeId);

    if (phases.length > 0) {
      const phaseList = phases.reduce((prev, curr) => {
        return `${prev},${curr}`;
      });

      request.input('CommaSeparatedTournamentPhaseIds', mssql.VarChar(1000), phaseList);
    }

    const result = await request.execute('dbo.up_AdminSetTournamentRegimePhases');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}