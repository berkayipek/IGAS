const express = require("express");
const router = express.Router();

const TransactionController = require('../controllers/transaction');
const checkAuth = require('../middleware/check-auth');

router.post("/send", TransactionController.tn_send);
router.get("/getblock/:number", TransactionController.tn_getBlock);

module.exports = router;
