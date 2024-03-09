const mssql = require('mssql');
const connection = require('../utilities/db').connection;

/**
 * @function
 * @param {String} cognitoSub 
 * @returns {Boolean}
 */
export async function validateAdminUser(cognitoSub) {
  if (!connection.isConnected) {
    await connection.createConnection();
  }

  const request = new mssql.Request();
  request.input('CognitoSub', mssql.VarChar(256), cognitoSub);

  const result = await request.execute('dbo.up_AdminValidateUser');
  console.log(result);

  if (result.recordset.length > 0) {
    return true;
  }

  return false;
}