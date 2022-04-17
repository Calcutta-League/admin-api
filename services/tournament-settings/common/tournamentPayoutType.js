import mssql from 'mssql';

/**
 * @typedef TournamentPayout
 * @property {Number} [payoutId]
 * @property {Number} regimeId
 * @property {Number} [phaseId]
 * @property {Number} payoutTypeId
 * @property {Number} [finalPosition]
 * @property {Number} defaultPayoutRate
 * @property {String} [payoutRateSuffix]
 * @property {Number} [precision]
 * @property {Boolean} global
 */

/**
 * @function populateTournamentPayoutTypeTVP
 * @param {Array<TournamentPayout>} payouts
 * @returns a sql server table-valued parameter populated with the provided tournament payouts
 */
export function populateTournamentPayoutTypeTVP(payouts) {
  const tvp = new mssql.Table();

  tvp.columns.add('TournamentPayoutId', mssql.BigInt, { nullable: true });
  tvp.columns.add('TournamentRegimeId', mssql.Int, { nullable: false });
  tvp.columns.add('TournamentPhaseId', mssql.Int, { nullable: true });
  tvp.columns.add('PayoutTypeId', mssql.Int, { nullable: false });
  tvp.columns.add('TeamFinalPosition', mssql.TinyInt, { nullable: true });
  tvp.columns.add('DefaultPayoutRate', mssql.Decimal(9, 4), { nullable: false });
  tvp.columns.add('PayoutRateSuffix', mssql.VarChar(10), { nullable: true });
  tvp.columns.add('PayoutRatePrecision', mssql.TinyInt, { nullable: true });
  tvp.columns.add('IsGlobal', mssql.Bit, { nullable: false });

  payouts.forEach(payout => {
    tvp.rows.add(
      payout.payoutId,
      payout.regimeId,
      payout.phaseId,
      payout.payoutTypeId,
      payout.finalPosition,
      payout.defaultPayoutRate,
      payout.payoutRateSuffix,
      payout.precision,
      payout.global
    );
  });

  return tvp;
}