import AWS from 'aws-sdk';
import { DYNAMODB_TABLES } from './constants';

const dynamodb = new AWS.DynamoDB();

const AUCTION_LEDGER_TABLE = DYNAMODB_TABLES.AUCTION_LEDGER_TABLE;

export async function syncAuctionLedger(leagueId, results) {
  const timestamp = new Date().valueOf();
  let itemCount = 0;
  let items = [];

  for (let sale of results) {
    if (itemCount == 25) {
      const params = {
        RequestItems: {
          AUCTION_LEDGER_TABLE: items
        },
        ReturnConsumedCapacity: 'TOTAL',
        ReturnItemCollectionMetrics: 'SIZE'
      };

      const writeResponse = await dynamodb.batchWriteItem(params).promise();
      console.log(writeResponse);

      itemCount = 0;
      items = [];
    }

    const ledgerItem = constructAuctionLedgerItem({ 
      leagueId: leagueId,
      ledgerId: timestamp + itemCount,
      ledgerAction: 'SALE',
      itemId: sale.ItemId,
      itemTypeId: sale.ItemTypeId,
      userId: sale.UserId,
      alias: sale.Alias,
      price: sale.Price
    });

    items.push(ledgerItem);
    itemCount++;
  }

  if (itemCount > 0 && items.length > 0) {
    const params = {
      RequestItems: {
        [AUCTION_LEDGER_TABLE]: items
      },
      ReturnConsumedCapacity: 'TOTAL',
      ReturnItemCollectionMetrics: 'SIZE'
    };
    console.log(params);

    const writeResponse = await dynamodb.batchWriteItem(params).promise();
    console.log(writeResponse);
  }
}

function constructAuctionLedgerItem({ leagueId, ledgerId, ledgerAction, itemId, itemTypeId, userId, alias, price }) {
  return {
    PutRequest: {
      Item: {
        LeagueId: {
          N: String(leagueId)
        },
        LedgerId: {
          N: String(ledgerId)
        },
        LedgerAction: {
          S: ledgerAction
        },
        ItemId: {
          N: String(itemId)
        },
        ItemTypeId: {
          N: String(itemTypeId)
        },
        UserId: userId == null ?
          { NULL: true } :
          { N: String(userId) },
        Alias: alias == null ?
          { NULL: true } :
          { S: alias },
        Price: price == null ?
          { NULL: true } :
          { N: String(price) }
      }
    }
  };
}