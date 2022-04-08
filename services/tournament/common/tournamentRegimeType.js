import mssql from 'mssql';

/**
 * @typedef TournamentRegimeType
 * @property {String} name
 * @property {Number} bracketTypeId
 * @property {String} description
 */

/**
 * @function populateTournamentRegimeTVP
 * @param {Number} tournamentId 
 * @param {Array<TournamentRegimeType>} regimes
 */
export function populateTournamentRegimeTVP(tournamentId, regimes) {
  const tvp = new mssql.Table();

  tvp.columns.add('TournamentId', mssql.SmallInt);
  tvp.columns.add('Name', mssql.VarChar(128));
  tvp.columns.add('DisplayOrder', mssql.TinyInt);
  tvp.columns.add('BracketTypeId', mssql.SmallInt);
  tvp.columns.add('Description', mssql.VarChar(500));

  regimes.forEach((regime, id) => {
    tvp.rows.add(tournamentId, regime.name, id, regime.bracketTypeId, regime.description);
  });

  return tvp;
}