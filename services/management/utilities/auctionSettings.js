import AWS from 'aws-sdk';
import { DYNAMODB_TABLES } from './constants';

const dynamodb = new AWS.DynamoDB();

const AUCTION_SETTINGS_TABLE = DYNAMODB_TABLES.AUCTION_SETTINGS_TABLE;

export async function syncAuctionSettings(leagueId, settings, slots, bidRules, taxRules) {
  const dynamodbParams = buildDynamoDbParams(leagueId, settings, slots, bidRules, taxRules);
  console.log(dynamodbParams);

  const updateResponse = await dynamodb.updateItem(dynamodbParams).promise();
  console.log(updateResponse);
}

function buildDynamoDbParams(leagueId, settings, slots, bidRules, taxRules) {
  const params = {
    TableName: AUCTION_SETTINGS_TABLE,
    ReturnValues: 'ALL_NEW',
    Key: {
      LeagueId: {
        N: String(leagueId)
      }
    },
    ExpressionAttributeNames: {
      '#AS': 'AuctionSettings',
      '#BR': 'BidRules',
      '#TR': 'TaxRules',
      '#ASlt': 'AuctionSlots'
    },
    ExpressionAttributeValues: {
      ':AS': {
        L: constructAuctionSettingsList(settings)
      },
      ':BR': {
        L: constructBidRulesList(bidRules)
      },
      ':TR': {
        L: constructTaxRulesList(taxRules)
      },
      ':ASlt': {
        L: constructAuctionSlotsList(slots)
      }
    },
    UpdateExpression: 'SET #AS = :AS, #BR = :BR, #TR = :TR, #ASlt = :ASlt'
  };

  return params;
}

function constructAuctionSettingsList(settings) {
  if (!Array.isArray(settings)) return [];
  
  return settings.map(s => {
    return {
      M: {
        code: {
          S: s.Code
        },
        constrained: {
          BOOL: s.Constrained
        },
        dataType: {
          S: s.DataType
        },
        decimalPrecision: s.DecimalPrecision != null ?
          { N: String(s.DecimalPrecision) } :
          { NULL: true },
        description: {
          S: s.Description
        },
        displayOrder: {
          N: String(s.DisplayOrder)
        },
        displayPrefix: s.DisplayPrefix != null ?
          { S: s.DisplayPrefix } :
          { NULL: true },
        displaySuffix: s.DisplaySuffix != null ?
          { S: s.DisplaySuffix } :
          { NULL: true },
        leagueId: {
          N: String(s.LeagueId)
        },
        maxValue: s.MaxValue != null ?
          { N: String(s.MaxValue) } :
          { NULL: true },
        minValue: s.MinValue != null ?
          { N: String(s.MinValue) } :
          { NULL: true },
        name: {
          S: s.Name
        },
        settingClass: {
          S: s.SettingClass
        },
        settingParameterId: {
          N: String(s.SettingParameterId)
        },
        settingValue: s.SettingValue != null ?
          { S: s.SettingValue } :
          { NULL: true },
        trailingText: s.TrailingText != null ?
          { S: s.TrailingText } :
          { NULL: true }
      }
    };
  });
}

function constructBidRulesList(settings) {
  if (!Array.isArray(settings)) return [];

  return settings.map(s => {
    return {
      M: {
        auctionBidRuleId: {
          N: String(s.AuctionBidRuleId)
        },
        helpText: {
          S: s.HelpText
        },
        leagueId: {
          N: String(s.LeagueId)
        },
        maxThresholdInclusive: s.MaxThresholdInclusive != null ?
          { N: String(s.MaxThresholdInclusive) } :
          { NULL: true },
        minIncrement: {
          N: String(s.MinIncrement)
        },
        minThresholdExclusive: {
          N: String(s.MinThresholdExclusive)
        }
      }
    };
  });
}

function constructTaxRulesList(settings) {
  if (!Array.isArray(settings)) return [];

  return settings.map(s => {
    return {
      M: {
        auctionTaxRuleId: {
          N: String(s.AuctionTaxRuleId)
        },
        helpText: {
          S: s.HelpText
        },
        leagueId: {
          N: String(s.LeagueId)
        },
        maxThresholdInclusive: s.MaxThresholdInclusive != null ?
          { N: String(s.MaxThresholdInclusive) } :
          { NULL: true },
        taxRate: {
          N: String(s.TaxRate)
        },
        minThresholdExclusive: {
          N: String(s.MinThresholdExclusive)
        }
      }
    };
  });
}

function constructAuctionSlotsList(data) {
  if (!Array.isArray(data)) return [];

  return data.map(d => {
    return {
      M: {
        itemId: {
          N: String(d.ItemId)
        },
        itemTypeId: {
          N: String(d.ItemTypeId)
        },
        teamLogoUrl: d.TeamLogoUrl != null ?
          { S: d.TeamLogoUrl } :
          { NULL: true },
        itemTypeName: {
          S: d.ItemTypeName
        },
        seed: d.Seed != null ?
          { N: String(d.Seed) } :
          { NULL: true },
        itemName: {
          S: d.ItemName
        },
        displayName: {
          S: d.DisplayName
        }
      }
    };
  });
}