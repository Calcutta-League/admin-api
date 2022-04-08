import mssql from 'mssql';

/**
 * @function populateTournamentPhasesTVP
 * @param {Array<String>} phases - a list of tournament phase names
 * @returns a sql server table-valued parameter populated with the provided tournament phases
 */
export function populateTournamentPhasesTVP(phases) {
  let tvp = new mssql.Table();

  tvp.columns.add('PhaseNum', mssql.TinyInt);
  tvp.columns.add('PhaseDescription', mssql.VarChar(100));

  phases.forEach((phaseName, id) => {
    tvp.rows.add(id, phaseName);
  });

  return tvp;
}