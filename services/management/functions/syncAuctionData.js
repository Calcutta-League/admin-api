import AWS from 'aws-sdk';
import { LAMBDAS } from '../utilities/constants';
import { fetchLegacyLeagues } from '../utilities/fetchLegacyLeagues';

const connection = require('../utilities/db').connection;

const lambda = new AWS.Lambda();

/**
 * Data to sync:
 * 
 * 1. LeagueMembership
 * 2. AuctionSettings
 * 3. AuctionSlots
 * 4. BidRules
 * 5. TaxRules
 * 6. AuctionResults -> AuctionLedger
 */

export async function syncLeague(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;
  const { leagueId } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    // fetch all data for the league from Sql Server
    const data = await pullData(cognitoSub, leagueId);
    console.log(data);

    const dumpRes = await dumpData({
      leagueId: leagueId,
      leagueMemberships: data.leagueMemberships,
      auctionSettings: data.auctionSettings,
      auctionSlots: data.auctionSlots,
      bidRules: data.bidRules,
      taxRules: data.taxRules,
      auctionResults: data.auctionResults
    });

    if (dumpRes) {
      await updateLeagueLegacyStatus(cognitoSub, leagueId);
    } else {
      throw new Error(`Error syncing leagueId: ${leagueId}`);
    }

    callback(null, { message: `LeagueId: ${leagueId} successfully synced` });
  } catch (error) {
    console.log(error);
    callback(null, { message: 'ERROR!' });
  }
}

export async function batchSyncLeagues(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;
  const { numLeagues } = event.body;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const leagues = await fetchLegacyLeagues(cognitoSub, numLeagues);

    for (let league of leagues) {
      const data = await pullData(cognitoSub, league.LeagueId);
      
      const dumpRes = await dumpData({
        leagueId: league.LeagueId,
        leagueMemberships: data.leagueMemberships,
        auctionSettings: data.auctionSettings,
        auctionSlots: data.auctionSlots,
        bidRules: data.bidRules,
        taxRules: data.taxRules,
        auctionResults: data.auctionResults
      });

      if (dumpRes) {
        await updateLeagueLegacyStatus(cognitoSub, league.LeagueId);
      } else {
        throw new Error(`Error syncing leagueId: ${league.LeagueId}`);
      }
    }

    callback(null, { message: `${numLeagues} leagues successfully synced` });
  } catch (error) {
    console.log(error);
    callback(null, { message: 'ERROR!' });
  }
}


async function pullData(cognitoSub, leagueId) {
  // fetch all data for the league from Sql Server
  const lambdaParams = {
    FunctionName: LAMBDAS.PULL_DATA_FROM_SQL_SERVER,
    LogType: 'Tail',
    Payload: JSON.stringify({
      cognitoSub: cognitoSub,
      leagueId: leagueId
    })
  };

  const lambdaResponse = await lambda.invoke(lambdaParams).promise();

  return lambdaResponse.Payload;
}

async function dumpData({ leagueId, leagueMemberships, auctionSettings, auctionSlots, bidRules, taxRules, auctionResults }) {
  const lambdaParams = {
    FunctionName: LAMBDAS.DUMP_DATA_INTO_DYNAMODB,
    LogType: 'Tail',
    Payload: JSON.stringify({
      leagueId: leagueId,
      leagueMemberships: leagueMemberships,
      auctionSettings: auctionSettings,
      auctionSlots: auctionSlots,
      bidRules: bidRules,
      taxRules: taxRules,
      auctionResults: auctionResults
    })
  };

  const lambdaResponse = await lambda.invoke(lambdaParams).promise();
  console.log(lambdaResponse);

  return !!lambdaResponse.Payload;
}

async function updateLeagueLegacyStatus(cognitoSub, leagueId) {
  const lambdaParams = {
    FunctionName: LAMBDAS.SKIP_SYNC_INVOKABLE,
    LogType: 'Tail',
    Payload: JSON.stringify({
      leagueId: leagueId,
      cognitoSub: cognitoSub
    })
  };

  const lambdaResponse = await lambda.invoke(lambdaParams).promise();
  console.log(lambdaResponse);
}