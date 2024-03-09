import { syncAuctionTable } from "../utilities/auction";
import { syncAuctionLedger } from "../utilities/auctionLedger";
import { syncAuctionSettings } from "../utilities/auctionSettings";
import { syncLeagueMemberships } from "../utilities/leagueMemberships";

export async function dumpDataIntoDynamoDb(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const { leagueId, leagueStatus, leagueMemberships, auctionSettings, auctionSlots, bidRules, taxRules, auctionResults } = event;

  try {
    await syncLeagueMemberships(leagueId, leagueMemberships);
    await syncAuctionSettings(leagueId, auctionSettings, auctionSlots, bidRules, taxRules);
    await syncAuctionLedger(leagueId, auctionResults);

    switch (leagueStatus) {
      case 'setup':
      case 'pre-auction':
        await syncAuctionTable(leagueId, 'initial');
        break;
      case 'in progress':
      case 'complete':
        await syncAuctionTable(leagueId, 'end');
        break;
    }

    callback(null, true);
  } catch (error) {
    console.log(error);
    callback(null, false);
  }
}