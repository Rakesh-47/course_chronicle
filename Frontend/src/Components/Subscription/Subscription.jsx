import React, { useContext, useEffect, useState } from "react";
// 1. Import hooks from react-router-dom for navigation
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../Context/AuthContext";

export default function Subscription() {
  const auth = useContext(AuthContext);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  // 2. Initialize the navigation and location hooks
  const navigate = useNavigate();
  const location = useLocation();

  // This hook efficiently loads the Razorpay script once when the component mounts.
  useEffect(() => {
    if (window.Razorpay) {
      setIsScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
        console.error("Razorpay SDK failed to load.");
        alert("Could not load payment gateway. Please check your connection and try again.");
    };
    document.body.appendChild(script);
  }, []);


  const paymentHandler = async (e) => {
    e.preventDefault();

    // --- UPDATED: Now redirects if the user is not logged in ---
    if (!auth.isLoggedIn) {
      alert("Please log in or sign up to make a purchase.");
      // 3. Redirect the user to the login page, remembering where they came from
      navigate('/signup', { state: { from: location } });
      return; // Stop the function here
    }
    
    if (!isScriptLoaded) {
        alert("Payment gateway is still loading. Please wait a moment and try again.");
        return;
    }

    try {
      const response = await fetch("/api/makePayment", {
        method: "POST",
        body: JSON.stringify({
          amount: 499 * 100, // Amount in paise
          currency: "INR",
          receipt: `receipt_user_${auth.userId}`
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
      });

      if(!response.ok) {
        throw new Error("Failed to create payment order.");
      }

      const order = await response.json();
      initializeRazorpay(order);

    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Could not initiate payment. Please try again later.");
    }
  };

  const initializeRazorpay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_TEST, // Your public Razorpay Key ID
      amount: order.amount,
      currency: "INR",
      name: "Xamgen",
      description: "Credits Purchase",
      image: "https://example.com/your_logo",
      order_id: order.id,
      handler: async function (response) {
        try {
          const validateRes = await fetch(
            "/api/validatePayment",
            {
              method: "POST",
              body: JSON.stringify(response),
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + auth.token,
              },
            }
          );
          
          if (!validateRes.ok) {
            throw new Error("Payment validation failed on the server.");
          }

          const res = await validateRes.json();
          
          alert("Payment Successful! Your new credit balance is updated.");
          auth.updateCredit(res.credit);

          // Clear any session data after success
          localStorage.removeItem('pendingPurchase');

        } catch (error) {
          console.error("Error validating payment:", error);
          alert("Your payment was successful, but there was an error updating your account. Please contact support.");
        }
      },
      prefill: {
        name: auth.userName,
        email: auth.userEmail,
      },
      notes: {
        userId: auth.userId,
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp1 = new window.Razorpay(options);

    rzp1.on("payment.failed", function (response) {
      console.error("Razorpay payment failed:", response.error);
      alert(`Payment failed: ${response.error.description}`);
    });

    rzp1.open();
  };

  return (
    <>
      <section className="bg-white dark:bg-gray-900 mt-10">
        <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
          <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
            <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
              Unlock Knowledge with Credits
            </h2>
            <p className="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">
              Get access to expert-verified answers by using credits. Purchase credits and explore a world of valuable knowledge.
            </p>
          </div>
          <div className="space-y-8 sm:gap-6 xl:gap-10 lg:space-y-0">
            <div className="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
              <h3 className="mb-4 text-2xl font-semibold">Credit Plan</h3>
              <p className="font-light text-gray-500 sm:text-lg dark:text-gray-400">
                Purchase credits to unlock answers and enhance your learning experience.
              </p>
              <div className="flex justify-center items-baseline my-8">
                <span className="mr-2 text-5xl font-extrabold">₹500</span>
                <span className="text-gray-500 dark:text-gray-400">for 10,000 Credits</span>
              </div>
              <ul role="list" className="mb-8 space-y-4 text-left">
                  {/* Your list items */}
                   <li className="flex items-center space-x-3">
                 <span>Each answer unlocks with credits</span>
                 </li>
                 <li className="flex items-center space-x-3">
                 <span>No hidden fees, pay only for what you use</span>
                 </li>
              </ul>
              <button
                onClick={paymentHandler}
                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white dark:focus:ring-blue-900"
              >
                Buy Credits
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}