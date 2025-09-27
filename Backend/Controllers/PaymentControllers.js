const HttpError = require("../Utils/HttpError");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../Models/User");

const RAZORPAY_KEY = process.env.RAZORPAY_TEST_KEY;
const RAZORPAY_SECRET = process.env.RAZORPAY_TEST_SECRET;

console.log("Razorpay Key ID Loaded:", RAZORPAY_KEY ? "Yes" : "No");

const MakePayment = async (req, res, next) => {
  try {
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY,
      key_secret: RAZORPAY_SECRET,
    });

    const options = req.body;
    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return next(new HttpError("Error creating Razorpay order", 500));
    }
    
    console.log("Created Razorpay Order:", order);
    res.json(order);

  } catch (error) {
    console.log("Error in MakePayment:", error);
    return next(new HttpError("Server error during payment creation", 500));
  }
};

const ValidatePayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, currentCredit } = req.body;

    const sha = crypto.createHmac("sha256", RAZORPAY_SECRET);
    
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return next(new HttpError("Transaction failed: Invalid signature", 400));
    }

    const user = await User.findById(req.userData.userId);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    
    // It's safer to use the credit value from the database
    user.Credit += 10000; 
    const savedUser = await user.save();
    
    console.log("User credit updated:", savedUser);
    res.status(200).json({ 
        message: "Payment successful!",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        credit: savedUser.Credit 
    });
    
  } catch (error) {
    console.log("Error in ValidatePayment:", error);
    return next(new HttpError("Server error during payment validation", 500));
  }
};

exports.MakePayment = MakePayment;
exports.ValidatePayment = ValidatePayment;