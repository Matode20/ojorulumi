import Stripe from "stripe";
import Order from "../models/Order.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid or empty products array",
      });
    }

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "ngn",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100), // Convert to smallest currency unit
      },
      quantity: item.quantity,
    }));

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      shipping_address_collection: {
        allowed_countries: ["NG"],
      },
      metadata: {
        shippingAddress: JSON.stringify(shippingAddress),
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const order = new Order({
        user: req.user._id,
        items: JSON.parse(session.metadata.items),
        shippingAddress: JSON.parse(session.metadata.shippingAddress),
        totalAmount: session.amount_total / 100,
        status: "processing",
        paymentStatus: "completed",
      });

      await order.save();

      res.json({ success: true, order });
    }
  } catch (error) {
    console.error("Payment success handler error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
