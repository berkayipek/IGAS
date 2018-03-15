const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Eos = require('eosjs');
const ecc = require('eosjs-ecc');

const User = require("../models/user");

exports.user_register = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists"
        });
      } else {
        console.log("email valid");
        User.find({ username: req.body.username })
          .exec()
          .then(user => {
            if (user.length >= 1) {
              return res.status(409).json({
                message: "Username exists"
              });
            } else {

              ecc.randomKey().then(privateKey => {
                const publicKey = ecc.privateToPublic(privateKey);
                const keyProvider = ['5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'];
                const eos = Eos.Localnet({keyProvider});
                eos.newaccount({
                  creator: 'inita',
                  name: req.body.username,
                  owner: publicKey,
                  active: publicKey,
                  recovery: 'inita',
                  deposit: '10 EOS'
                }).then(() => {
                  const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    email: req.body.email,
                    username: req.body.username,
                    address: publicKey
                  });
                  user
                    .save()
                    .then(result => {
                      console.log(result + "private key: " + privateKey);
                      res.status(201).json({
                        message: "User created, privateKey = " + privateKey + "public: " + publicKey
                      });
                    })
                    .catch(err => {
                      console.log(err);
                      res.status(500).json({
                        error: err
                      });
                    });
                });
              });


            }
          });
      }
    });
};

exports.user_login = (req, res, next) => {
  User.find({ username: req.body.username })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      const address = ecc.privateToPublic(req.body.privateKey);
      console.log(user[0].address + "  address: " + address);
      if (address == user[0].address) {
        const token = jwt.sign(
          {
            email: user[0].email,
            userId: user[0]._id,
            address: user[0].address
          },
          process.env.JWT_KEY,
          {
            expiresIn: "1h"
          }
        );
        return res.status(201).json({
          success: true,
          message: "Auth successful",
          token: token
        });
      }
      res.status(401).json({
        message: "Auth failed " + address + "     " + user[0].address
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.user_profile = (req, res, next) => {
  User.find({ username: req.params.username })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      const keyprovider = ["5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3", "5KJ3Q4amCZHr6xutNJwjfK6j9ND4kTUJE9qABRizcPHSBPLEo2B", "EOS5apWfT4iMxY1WoZ2J9DZ1X7RaUiG7z7b6ubSaY4RPBKAqMtcRW"];
      const eos = Eos.Localnet({keyprovider});
      const gettableoptions = {
        json: true,
        table_key: "currency",
        scope: req.params.username,
        code: "currency",
        table: "account"
      }
      eos.getAccount(req.params.username).then(
        details => {
          eos.getTableRows(gettableoptions).then(results => {
            const userDetails = {
              username: user[0].username,
              email: user[0].email,
              address: user[0].address,
              balance: results.rows[0].balance,
              eosBalance: details.eos_balance
            }
            console.log(results.rows);
            res.json({
              user: userDetails
            });
          });
        });

    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.user_delete = (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};
