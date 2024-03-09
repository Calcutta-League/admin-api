const mssql = require('mssql');

export async function getDataFromProc(cognitoSub, leagueId, procName) {
  const request = new mssql.Request();
  request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
  request.input('LeagueId', mssql.BigInt, leagueId);

  const result = await request.execute(procName);
  console.log(result.recordset);

  return result.recordset;
}