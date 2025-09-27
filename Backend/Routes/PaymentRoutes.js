const express = require("express");
const router = express.Router();
const PaymentControllers = require( "../Controllers/PaymentControllers")
const IsAuthenticated = require( "../Middleware/UserAuth")

router.post( '/makePayment' , IsAuthenticated , PaymentControllers.MakePayment);
router.post( '/validatePayment' , IsAuthenticated , PaymentControllers.ValidatePayment);

module.exports = router;