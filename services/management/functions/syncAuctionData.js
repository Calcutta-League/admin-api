import AWS from 'aws-sdk';
import { getDataFromProc } from '../utilities/getSqlServerData';
import { LAMBDAS } from '../utilities/constants';
import { markLeagueNonLegacy } from '../utilities/markLeagueNonLegacy';
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
  const leagueId = +event.path.leagueId;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    // fetch all data for the league from Sql Server
    const data = await pullData(cognitoSub, leagueId);

    await dumpData({
      leagueId: leagueId,
      leagueMemberships: data.leagueMemberships,
      auctionSettings: data.auctionSettings,
      auctionSlots: data.auctionSlots,
      bidRules: data.bidRules,
      taxRules: data.taxRules,
      auctionResults: data.auctionResults
    });

    callback(null, { message: `LeagueId: ${leagueId} successfully synced` });
  } catch (error) {
    console.log(error);
    callback(null, { message: 'ERROR!' });
  }
}

export async function batchSyncLeagues(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;
  const numLeagues = +event.path.numLeagues;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const leagues = await fetchLegacyLeagues(cognitoSub, numLeagues);

    for (let league of leagues) {
      const data = await pullData(cognitoSub, league.LeagueId);
      
      await dumpData({
        leagueId: league.LeagueId,
        leagueMemberships: data.leagueMemberships,
        auctionSettings: data.auctionSettings,
        auctionSlots: data.auctionSlots,
        bidRules: data.bidRules,
        taxRules: data.taxRules,
        auctionResults: data.auctionResults
      });
    }

    callback(null, { message: `${numLeagues} leagues successfully synced` });
  } catch (error) {
    console.log(error);
    callback(null, { message: 'ERROR!' });
  }
}


async function pullData(cognitoSub, leagueId) {
  // fetch all data for the league from Sql Server
  const leagueMemberships = await getDataFromProc(cognitoSub, leagueId, 'dbo.up_AdminGetLeagueMemberships');
  const auctionSettings = await getDataFromProc(cognitoSub, leagueId, 'dbo.up_AdminGetAuctionSettings');
  const auctionSlots = await getDataFromProc(cognitoSub, leagueId, 'dbo.up_AdminGetAuctionSlots');
  const bidRules = await getDataFromProc(cognitoSub, leagueId, 'dbo.up_AdminGetAuctionBidRules');
  const taxRules = await getDataFromProc(cognitoSub, leagueId, 'dbo.up_AdminGetAuctionTaxRules');
  const auctionResults = await getDataFromProc(cognitoSub, leagueId, 'dbo.up_AdminGetAuctionResults');

  return {
    leagueMemberships: leagueMemberships,
    auctionSettings: auctionSettings,
    auctionSlots: auctionSlots,
    bidRules: bidRules,
    taxRules: taxRules,
    auctionResults: auctionResults
  };
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

  if (!!lambdaResponse.Payload) {
    await markLeagueNonLegacy(cognitoSub, leagueId);
  } else {
    throw new Error(`Error syncing leagueId: ${leagueId}`);
  }
}