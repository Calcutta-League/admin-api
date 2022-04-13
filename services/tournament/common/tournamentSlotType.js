import mssql from 'mssql';

/**
 * @typedef TournamentSlot
 * @property {Number} seed - seed-value of the slot
 * @property {String} name - name of the slot
 * @property {Number} teamId - unique identifier of the team entity occupying this slot (if applicable)
 */

/**
 * @function populateTournamentSlotsTVP
 * @param {Number} tournamentRegimeId - unique identifier for the tournament regime
 * @param {Array<TournamentSlot>} slots - list of tournament slot objects
 * @returns {mssql.Table} a sql server table-valued parameter populated with the provided tournament slots
 */
export function populateTournamentSlotsTVP(tournamentRegimeId, slots) {
  const tvp = new mssql.Table();

  tvp.columns.add('TournamentRegimeId', mssql.Int);
  tvp.columns.add('Seed', mssql.TinyInt);
  tvp.columns.add('TournamentSlotName', mssql.VarChar(100));
  tvp.columns.add('TeamId', mssql.BigInt);

  slots.forEach(slot => {
    tvp.rows.add(tournamentRegimeId, slot.seed, slot.name, slot.teamId);
  });

  return tvp;
}

/**
 * @typedef ExistingTournamentSlot
 * @property {Number} slotId - tournament slot's unique identifier
 * @property {Number} seed - seed-value of the slot
 * @property {String} name - name of the slot
 * @property {Number} teamId - unique identifier of the team entity occupying this slot (if applicable)
 */

/**
 * @function populateExistingTournamentSlotsTVP
 * @param {Number} tournamentRegimeId - unique identifier for the tournament regime
 * @param {Array<ExistingTournamentSlot>} slots - list of tournament slot objects
 * @returns {mssql.Table} a sql server table-valued parameter populated with the provided tournament slots
 */
export function populateExistingTournamentSlotsTVP(tournamentRegimeId, slots) {
  const tvp = new mssql.Table();

  tvp.columns.add('TournamentSlotId', mssql.Int);
  tvp.columns.add('TournamentRegimeId', mssql.Int);
  tvp.columns.add('Seed', mssql.TinyInt);
  tvp.columns.add('TournamentSlotName', mssql.VarChar(100));
  tvp.columns.add('TeamId', mssql.BigInt);

  slots.forEach(slot => {
    tvp.rows.add(slot.slotId, tournamentRegimeId, slot.seed, slot.name, slot.teamId);
  });

  return tvp;
}