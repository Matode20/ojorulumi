import Stripe from "stripe";
import Order from "../models/Order.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    console.log("Creating session with shipping:", shippingAddress);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "ngn",
          product_data: {
            name: item.name,
            images: [item.image],
            metadata: {
              productId: item._id,
            },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        products: JSON.stringify(
          items.map((item) => ({
            id: item._id,
            quantity: item.quantity,
            price: item.price,
          }))
        ),
        shippingAddress: JSON.stringify(shippingAddress), // Store shipping address in metadata
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Check if order already exists for this session
    const existingOrder = await Order.findOne({
      "metadata.sessionId": sessionId,
    });

    if (existingOrder) {
      return res.json({
        success: true,
        order: existingOrder,
        message: "Order already processed",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Create new order
    const order = new Order({
      user: req.user._id,
      items: session.metadata.products
        ? JSON.parse(session.metadata.products)
        : [],
      shippingAddress: session.metadata.shippingAddress
        ? JSON.parse(session.metadata.shippingAddress)
        : {},
      totalAmount: session.amount_total / 100,
      status: "processing",
      paymentStatus: "completed",
      metadata: {
        sessionId, // Store sessionId for future reference
      },
    });

    await order.save();

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Checkout success error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing checkout",
      error: error.message,
    });
  }
};
