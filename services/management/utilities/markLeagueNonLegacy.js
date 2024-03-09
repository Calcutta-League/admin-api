const mssql = require('mssql');

export async function markLeagueNonLegacy(cognitoSub, leagueId) {
  const request = new mssql.Request();
  request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
  request.input('LeagueId', mssql.BigInt, leagueId);

  const result = await request.execute('dbo.up_AdminMarkLeagueNonLegacy');
  console.log(result);

  if (result?.recordset && result.recordset?.length && result.recordset[0]?.Error) {
    return false;
  }

  return true;
}