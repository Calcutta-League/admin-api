const connection = require('../../../utilities/db').connection;
const mssql = require('mssql');

export async function updateScores(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  console.log(event);

  let cognitoSub = event.cognitoPoolClaims.sub;

  let [postponedGames, scoredGames] = parseGamesList(event.body);
  console.log(postponedGames);
  console.log(scoredGames);

  try {
    if (!connection.isConnected) {
      await connection.createConnection();
    }

    if (postponedGames.length > 0) {
      let tvp = populatePostponedTVP(postponedGames);

      const request = new mssql.Request();
      request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
      request.input('MultiGameType', tvp);

      let result = await request.execute('dbo.up_AdminUpdateGameMetadata');
      console.log(result);
    }

    if (scoredGames.length > 0) {
      let tvp = populateScoredTVP(scoredGames);

      const request = new mssql.Request();
      request.input('CognitoSub', mssql.VarChar(256), cognitoSub);
      request.input('MultiGameScores', tvp);

      let result = await request.execute('dbo.up_AdminUpdateScores');
      console.log(result);
    }

    callback(null, { message: 'success' });
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
}

function parseGamesList(gamesList) {
  let postponedGames = [];
  let scoredGames = [];
  let gameIds = Object.keys(gamesList);

  gameIds.forEach(id => {
    let game = gamesList[id];
    if (game !== undefined) {
      let gameObj = { gameId: id };

      // postponed check
      if (game.Postponed === true) {
        gameObj.postponed = 1;

        postponedGames.push(gameObj);
      } else if (game.Team1Score !== undefined && game.Team2Score !== undefined && +game.Team1Score !== +game.Team2Score) {
        gameObj.team1Score = +game.Team1Score;
        gameObj.team2Score = +game.Team2Score;
        gameObj.overtime = !!game.Overtime ? 1 : 0;

        scoredGames.push(gameObj);
      }
    }
  });

  return [postponedGames, scoredGames];
}

function populatePostponedTVP(postponedGames) {
  let tvp = new mssql.Table();

  tvp.columns.add('GameId', mssql.BigInt());
  tvp.columns.add('Date', mssql.Date());
  tvp.columns.add('Postponed', mssql.Bit());

  postponedGames.forEach(game => {
    tvp.rows.add(game.gameId, null, game.postponed);
  });

  return tvp;
}

function populateScoredTVP(scoredGames) {
  let tvp = new mssql.Table();

  tvp.columns.add('GameId', mssql.BigInt());
  tvp.columns.add('Team1Score', mssql.Int());
  tvp.columns.add('Team2Score', mssql.Int());
  tvp.columns.add('Overtime', mssql.Bit());

  scoredGames.forEach(game => {
    tvp.rows.add(game.gameId, game.team1Score, game.team2Score, game.overtime);
  });

  return tvp;
}