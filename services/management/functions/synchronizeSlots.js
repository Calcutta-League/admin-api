import AWS from 'aws-sdk';
import { LAMBDAS } from '../utilities/constants';

const lambda = new AWS.Lambda();

/**
 * This lambda synchronizes the AuctionSlots in dynamodb every time a human admin
 * updates a TournamentSlot in the admin portal
 */

export async function synchronizeSlots(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  const cognitoSub = event.cognitoPoolClaims.sub;
  const { tournamentRegimeId } = event.body;

  try {
    const leagues = await pullLeaguesForTournamentRegime(cognitoSub, tournamentRegimeId);
    console.log(leagues);
    const leagueCount = leagues.length;

    for (let l of leagues) {
      const slots = await pullLeagueSlots(cognitoSub, l.LeagueId);

      await setSlotsInDynamoDb(l.LeagueId, slots);
    }

    callback(null, { message: `${leagueCount} leagues updated`});
  } catch (error) {
    console.log(error);
    callback(null, { error: error });
  }
}

async function pullLeaguesForTournamentRegime(cognitoSub, tournamentRegimeId) {
  const lambdaParams = {
    FunctionName: LAMBDAS.PULL_LEAGUES_FOR_TOURNAMENT_REGIME,
    LogType: 'Tail',
    Payload: JSON.stringify({
      cognitoSub: cognitoSub,
      tournamentRegimeId: tournamentRegimeId
    })
  };

  const lambdaResponse = await lambda.invoke(lambdaParams).promise();

  return JSON.parse(lambdaResponse.Payload);
}

async function pullLeagueSlots(cognitoSub, leagueId) {
  const lambdaParams = {
    FunctionName: LAMBDAS.PULL_LEAGUE_SLOTS,
    LogType: 'Tail',
    Payload: JSON.stringify({
      cognitoSub: cognitoSub,
      leagueId: leagueId
    })
  };

  const lambdaResponse = await lambda.invoke(lambdaParams).promise();

  return JSON.parse(lambdaResponse.Payload);
}

async function setSlotsInDynamoDb(leagueId, slots) {
  const lambdaParams = {
    FunctionName: LAMBDAS.SYNC_AUCTION_SETTINGS,
    LogType: 'Tail',
    Payload: JSON.stringify({ leagueId: leagueId, settingCategory: 'SLOT', settings: slots })
  };

  await lambda.invoke(lambdaParams).promise();
}