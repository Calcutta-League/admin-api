const mssql = require('mssql');

export async function fetchLegacyLeagues(cognitoSub, numLeagues = 100) {
  const request = new mssql.Request();
  request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
  request.input('NumLeagues', mssql.Int, numLeagues);

  const result = await request.execute('dbo.up_AdminGetLegacyLeagues');
  console.log(result);

  if (result?.recordset && result.recordset?.length && result.recordset[0]?.Error) {
    throw new Error(result.recordset[0]?.Error);
  }

  return result.recordset;
}