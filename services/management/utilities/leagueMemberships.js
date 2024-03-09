import AWS from 'aws-sdk';
import { DYNAMODB_TABLES } from './constants';

const dynamodb = new AWS.DynamoDB();

const LEAGUE_MEMBERSHIP_TABLE = DYNAMODB_TABLES.LEAGUE_MEMBERSHIP_TABLE;

export async function syncLeagueMemberships(leagueId, leagueMemberships) {
  const dynamodbParams = buildDynamoDbParams(leagueId, leagueMemberships);
  console.log(dynamodbParams);

  const updateResponse = await dynamodb.updateItem(dynamodbParams).promise();
  console.log(updateResponse);
}


/**
 * @typedef LeagueMembership
 * @property {Number} LeagueMembershipId
 * @property {Number} UserId
 * @property {String} Alias
 * @property {String} CognitoSub
 * @property {Number} RoleId
 * @property {String} RoleName
 */

/**
 * @function
 * @param {Number} leagueId 
 * @param {Array<LeagueMembership>} leagueMemberships 
 */
function buildDynamoDbParams(leagueId, leagueMemberships) {
  if (leagueMemberships?.length == 0) throw new Error('League membership list is empty');

  const parsedLeagueMemberships = constructLeagueMembershipList(leagueMemberships);

  const dynamoDbParams = {
    TableName: LEAGUE_MEMBERSHIP_TABLE,
    ReturnValues: 'ALL_NEW',
    Key: {
      LeagueId: {
        N: String(leagueId)
      }
    },
    ExpressionAttributeNames: {
      '#LM': 'LeagueMemberships'
    },
    ExpressionAttributeValues: {
      ':LM': {
        L: parsedLeagueMemberships
      }
    },
    UpdateExpression: 'SET #LM = :LM'
  };

  return dynamoDbParams;
}

/**
 * @function
 * @param {Array<LeagueMembership>} leagueMemberships
 */
function constructLeagueMembershipList(leagueMemberships) {
  return leagueMemberships.map(m => {
    return {
      M: {
        leagueMembershipId: {
          N: String(m.LeagueMembershipId)
        },
        userId: {
          N: String(m.UserId)
        },
        alias: {
          S: m.Alias
        },
        cognitoSub: {
          S: m.CognitoSub
        },
        roleId: {
          N: String(m.RoleId)
        },
        roleName: {
          S: m.RoleName
        }
      }
    };
  });
}