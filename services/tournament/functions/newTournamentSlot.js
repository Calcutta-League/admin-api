import { populateTournamentSlotsTVP } from '../common';

const connection = require('../utilities/db').connection;
const mssql = require('mssql');

export async function newTournamentSlot(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;

  const { tournamentRegimeId, slots } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const request = new mssql.Request();

    request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
    
    if (slots.length) {
      const tvp = populateTournamentSlotsTVP(tournamentRegimeId, slots);

      request.input('TournamentSlots', tvp);
    }

    const result = await request.execute('dbo.up_AdminNewTournamentSlot');

    callback(null, result.recordset);
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}