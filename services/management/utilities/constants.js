export const LAMBDAS = {
  DUMP_DATA_INTO_DYNAMODB: `calcutta-admin-management-${process.env.APP_ENV}-dumpDataIntoDynamoDb`,
  PULL_DATA_FROM_SQL_SERVER: `calcutta-admin-management-${process.env.APP_ENV}-pullDataFromSqlServer`,
  SKIP_SYNC_INVOKABLE: `calcutta-admin-management-${process.env.APP_ENV}-skipSyncInvokable`
};

export const DYNAMODB_TABLES = {
  AUCTION_SETTINGS_TABLE: process.env.AUCTION_SETTINGS_TABLE,
  LEAGUE_MEMBERSHIP_TABLE: process.env.LEAGUE_MEMBERSHIP_TABLE,
  AUCTION_LEDGER_TABLE: process.env.AUCTION_LEDGER_TABLE
};