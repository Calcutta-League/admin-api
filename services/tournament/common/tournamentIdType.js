import mssql from 'mssql';

/**
 * @function populateTournamentIdTVP
 * @param {Array<Number>} tournamentIds - list of tournament Ids
 * @returns a sql server table-valued parameter populated with the provided tournament Ids
 */
export function populateTournamentIdTVP(tournamentIds) {
  const tvp = new mssql.Table();

  tvp.columns.add('TournamentId', mssql.Int);

  tournamentIds.forEach(tournamentId => {
    tvp.rows.add(tournamentId);
  });

  return tvp;
}