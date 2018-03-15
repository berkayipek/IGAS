const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Eos = require('eosjs');

const User = require("../models/user");

exports.tn_send = (req, res, next) => {
  const sender = req.body.username;
  const reciever = req.body.reciever;
  const amount = req.body.amount;
  const keyProvider = [req.body.privateKey, 'EOS5apWfT4iMxY1WoZ2J9DZ1X7RaUiG7z7b6ubSaY4RPBKAqMtcRW', '5KJ3Q4amCZHr6xutNJwjfK6j9ND4kTUJE9qABRizcPHSBPLEo2B'];
  const eos = Eos.Localnet({keyProvider});
  eos.contract('currency').then(currency => {
    // Transfer is one of the actions in currency.abi
    currency.transfer(sender, reciever, amount);
  });
  const gettableoptions = {
    json: true,
    table_key: "currency",
    scope: reciever,
    code: "currency",
    table: "account"
  }

  eos.getTableRows(gettableoptions).then(results => {
    res.status(201).json({
      message: "Successfully send!",
      results: results
    });
  });
  // eos.getAccount(reciever).then(
  //   results => {
  //     res.status(201).json({
  //       message: results
  //     });
  //   });
};
// eos.getAccount(reciever).then(
//   results => {res.status(201).json({
//   message: results
//   });
// });
// eos.contract('currency').then(currency => {
//   // Transfer is one of the actions in currency.abi
//   currency.get_balance(reciever).then( results => {
//     res.status(201).json({
//       message: results
//     });
//   });
// });
exports.tn_getBlock = (req, res, next) => {
  const keyProvider = [];
  const eos = Eos.Localnet({keyProvider});
  eos.getBlock(req.params.number).then(result => {
    res.status(201).json({
      message: "Successfully send!",
      results: result
    });
  });
};
