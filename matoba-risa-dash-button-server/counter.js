"use strict";
const doc = require("./document");

const sumTableName = process.env.DYNAMODB_SUM_TABLE;

exports.countUp = async event => {
  const { Records: records } = event;
  const total = records.map(record => {
    if (record.eventName !== "INSERT") return 0;
    const count = parseInt(record.dynamodb.NewImage.count.N);
    if (!count) return 0;
    return count;
  }).reduce((p, c) => p + c, 0);
  await doc.update({
    TableName: sumTableName,
    Key: { name: "sum" },
    UpdateExpression: "SET #val = #val + :add",
    ExpressionAttributeNames: { "#val": "value" },
    ExpressionAttributeValues: { ":add": total }
  });
};
