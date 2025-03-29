import Order from "../models/Order.js";
 const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;
    const userId = req.user._id; // Assuming you have auth middleware

    const order = new Order({
      user: userId,
      items: items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress,
      totalAmount,
      status: "pending",
    });

    await order.save();

    // Clear the user's cart after successful order
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    res.status(201).json({
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

export default createOrder
