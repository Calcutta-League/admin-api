import AWS from 'aws-sdk';
import { DYNAMODB_TABLES } from './constants';

const dynamodb = new AWS.DynamoDB();

const AUCTION_TABLE = DYNAMODB_TABLES.AUCTION_TABLE;

export async function syncAuctionTable(leagueId, auctionStatus) {
  const timestamp = new Date().valueOf().toString();

  const params = {
    TableName: AUCTION_TABLE,
    Key: {
      N: String(leagueId)
    },
    ExpressionAttributeNames: {
      '#TS': 'LastBidTimestamp',
      '#S': 'Status',
      '#CId': 'CurrentItemId',
      '#P': 'CurrentItemPrice',
      '#W': 'CurrentItemWinner',
      '#A': 'Alias',
      '#L': 'TeamLogoUrl',
      '#IT': 'ItemTypeId',
      '#N': 'ItemName',
      '#Sd': 'Seed',
      '#DN': 'DisplayName',
      '#B': 'BidId',
      '#PB': 'PrevBidId'
    },
    ExpressionAttributeValues: {
      ':TS': {
        NULL: true
      },
      ':S': {
        S: auctionStatus
      },
      ':CId': {
        NULL: true
      },
      ':P': {
        NULL: true
      },
      ':W': { NULL: true },
      ':A': { NULL: true },
      ':L': { NULL: true },
      ':IT': {
        NULL: true
      },
      ':N': {
        NULL: true
      },
      ':Sd': { NULL: true },
      ':DN': {
        NULL: true
      },
      ':B': {
        N: timestamp // using timestamp instead of uuid because I want it to be useful in RANGE queries against the BidHistory table
      },
      ':PB': {
        NULL: true
      }
    },
    UpdateExpression: 'SET #TS = :TS, #S = :S, #CId = :CId, #P = :P, #W = :W, #A = :A, #L = :L, #IT = :IT, #N = :N, #Sd = :Sd, #DN = :DN, #B = :B, #PB = :PB',
    ConditionExpression: 'attribute_not_exists(#S)'
  };

  const updateResponse = await dynamodb.updateItem(params).promise();
  console.log(updateResponse);
}