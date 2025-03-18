import Product from "../models/Product";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.log("Error in getAllProducts", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
