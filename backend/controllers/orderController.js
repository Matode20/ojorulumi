import Order from "../models/Order.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;

    console.log("Creating order with:", {
      userId: req.user._id,
      items,
      shippingAddress,
      totalAmount,
    });

    const order = new Order({
      user: req.user._id,
      items: items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress,
      totalAmount,
      status: "pending",
      paymentStatus: "pending",
    });

    const savedOrder = await order.save();
    console.log("Order saved with ID:", savedOrder._id);

    res.status(201).json({
      success: true,
      order: savedOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

export const createOrderFromSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Check for existing order with this session ID
    const existingOrder = await Order.findOne({
      "metadata.sessionId": sessionId,
    });

    if (existingOrder) {
      console.log("Order already exists for session:", sessionId);
      return res.json({
        success: true,
        order: existingOrder,
        message: "Order already processed",
      });
    }

    console.log("Creating order from session:", sessionId); // Debug log

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    console.log("Stripe session:", session); // Debug log

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Create order in database
    const order = new Order({
      user: req.user._id,
      items: session.line_items.data.map((item) => ({
        product: item.price.product,
        quantity: item.quantity,
        price: item.price.unit_amount / 100,
      })),
      shippingAddress: JSON.parse(session.metadata.shippingAddress),
      totalAmount: session.amount_total / 100,
      status: "processing",
      paymentStatus: "completed",
    });

    console.log("Creating order:", order); // Debug log

    await order.save();
    console.log("Order saved successfully"); // Debug log

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    console.log("getAdminOrders called at:", new Date().toISOString());

    const orders = await Order.find()
      .populate("user", "email")
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    console.log(`Found ${orders.length} orders`);

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price') // Specify fields to populate
      .sort({ createdAt: -1 });

    console.log('Found orders:', orders); // Debug log

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};
