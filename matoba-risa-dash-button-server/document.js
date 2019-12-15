const DynamoDB = require("aws-sdk").DynamoDB;

const promisify = (func, reciever) => {
  reciever = reciever || this;
  return (...args) => {
    return new Promise((resolve, reject) => {
      func.call(reciever, ...args, (err, ...iargs) => {
        if (err) reject(err)
        else resolve(...iargs);
      });
    });
  };
};

const docClient = new DynamoDB.DocumentClient({region: "ap-northeast-1"});
exports.put = promisify(docClient.put, docClient);
exports.get = promisify(docClient.get, docClient);
exports.update = promisify(docClient.update, docClient);