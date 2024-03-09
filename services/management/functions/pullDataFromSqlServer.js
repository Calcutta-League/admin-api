import { getDataFromProc } from '../utilities/getSqlServerData';

const connection = require('../utilities/db').connection;

export async function pullDataFromSqlServer(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const { leagueId, cognitoSub } = event;

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    const data = await pullData(cognitoSub, leagueId);

    callback(null, data);
  } catch (error) {
    console.log(error);
    callback(null, error);
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