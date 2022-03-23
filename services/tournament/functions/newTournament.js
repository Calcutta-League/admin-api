const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function newTournament(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  let cognitoSub = event.cognitoPoolClaims.sub;

  let [tournamentName, adminOnly, sportId, phases] = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    request.input('TournamentName', mssql.VarChar(128), tournamentName);
    request.input('SportId', mssql.Int, sportId);
    request.input('TestOnly', mssql.Bit, adminOnly);

    if (phases.length > 0) {
      let tvp = populateTournamentPhasesTVP(phases);

      request.input('TournamentPhases', tvp);
    }

    let result = await request.execute('dbo.up_AdminNewTournament');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}

function populateTournamentPhasesTVP(phases) {
  let tvp = new mssql.Table();

  tvp.columns.add('PhaseNum', mssql.TinyInt);
  tvp.columns.add('PhaseDescription', mssql.VarChar(100));

  phases.forEach((phase, id) => {
    tvp.rows.add(id, phase);
  });

  return tvp;
}