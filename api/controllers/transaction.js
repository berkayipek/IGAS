const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Eos = require('eosjs');

const User = require("../models/user");

exports.tn_send = (req, res, next) => {
  const sender = req.body.accountName;
  const reciever = req.body.reciever;
  const amount = req.body.amount;
  const keyprovider = [req.body.privateKey, "EOS87xTQe5jymEREgxVVSLhjWKK3C5LTHfZEJWesg97BTtmF6ZJHx"];
  const eos = Eos.Localnet({keyprovider});
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
      message: "Successfully send!"
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
  const keyprovider = [];
  const eos = Eos.Localnet({keyprovider});
  eos.getBlock(req.params.number).then(result => {
    console.log(result);
  });
};