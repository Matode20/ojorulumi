import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";

const PurchaseSuccessPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const { clearCart } = useCartStore();
  const [error, setError] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    const handleCheckoutSuccess = async () => {
      // Prevent multiple processing of the same session
      if (processedRef.current) return;

      try {
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get("session_id");

        console.log("Processing session:", sessionId);

        if (!sessionId) {
          throw new Error("No session ID found in URL");
        }

        processedRef.current = true; // Mark as processed

        const response = await axios.post("/payments/checkout-success", {
          sessionId,
        });

        if (response.data.success) {
          setOrderNumber(response.data.order._id.slice(-6));
          clearCart();
          localStorage.removeItem("shippingAddress");
        }
      } catch (error) {
        console.error("Checkout error:", error);
        setError(error.message);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCheckoutSuccess();

    // Cleanup function
    return () => {
      processedRef.current = false;
    };
  }, [location.search, clearCart]); // Only depend on search params and clearCart

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-emerald-400">Processing your order...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center px-4 bg-gray-900">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
      />

      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <CheckCircle className="text-emerald-400 w-16 h-16 mb-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2">
            Purchase Successful!
          </h1>

          <p className="text-gray-300 text-center mb-2">
            Thank you for your order. We're processing it now.
          </p>
          <p className="text-emerald-400 text-center text-sm mb-6">
            You will receive an email soon for order details and updates.
          </p>
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Order number</span>
              <span className="text-sm font-semibold text-emerald-400">
                #{orderNumber || "Processing..."}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Estimated delivery</span>
              <span className="text-sm font-semibold text-emerald-400">
                3-5 business days
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* <button
              onClick={() => navigate("/orders")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4
                rounded-lg transition duration-300 flex items-center justify-center"
            >
              <HandHeart className="mr-2" size={18} />
              View Your Orders
            </button> */}
            <Link
              to="/"
              className="w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 
                rounded-lg transition duration-300 flex items-center justify-center"
            >
              Continue Shopping
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
