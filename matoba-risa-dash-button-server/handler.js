'use strict';
const uuidv4 = require("uuid/v4");
const doc = require("./document");

const logTableName = process.env.DYNAMODB_LOG_TABLE;
const sumTableName = process.env.DYNAMODB_SUM_TABLE;
const RISA = "Spin-off!と集貝はなさんにありがとう。";
const makeResponse = (code, data) => {
  return {
    statusCode: code,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }
};
const checkData = data => {
  return data.risa && data.risa === RISA && data.token;
};

const fetchSum = async () => {
  const {Item: item} = await doc.get({
    TableName: sumTableName,
    Key: { name: "sum" },
    ReturnConsumedCapacity: "NONE",
  })
  return item.value;
};

exports.getTotal = async event => {
  if (!checkData(event.queryStringParameters)) {
    return makeResponse(400, {
      message: "Bad Request."
    });
  }
  try {
    return makeResponse(200, {
      count: await fetchSum(),
    });
  } catch(e) {
    return makeResponse(500, {
      message: "Internal Server Error."
    });
  }
};

const writeLog = log => {
  return doc.put({
    TableName: logTableName,
    Item: {
      id: uuidv4(),
      datetime: new Date().toISOString(),
      count: log.count,
      token: log.token,
    }
  });
}

exports.order = async event => {
  const data = JSON.parse(event.body);
  if (!checkData(data) || typeof data.count !== "number") {
    return makeResponse(400, {
      message: "Bad Request.",
    });
  }
  try {
    await writeLog(data);
    return makeResponse(200, {
      message: 'Success.',
    });
  } catch(e) {
    return makeResponse(500, {
      message: "Internal Server Error."
    });
  }
}