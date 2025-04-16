import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { formatDistance } from "date-fns";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/order/user"); // Update this line
        console.log("Orders response:", response.data);
        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          throw new Error(response.data.message || "Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "processing":
        return <Package className="text-blue-400" size={20} />;
      case "shipped":
        return <Truck className="text-yellow-400" size={20} />;
      case "delivered":
        return <CheckCircle className="text-green-400" size={20} />;
      case "cancelled":
        return <XCircle className="text-red-400" size={20} />;
      default:
        return <AlertCircle className="text-gray-400" size={20} />;
    }
  };

  const renderOrderItem = (item) => {
    if (!item || !item.product) {
      console.log("Invalid item:", item);
      return null;
    }

    return (
      <div key={item._id} className="flex justify-between items-center">
        <span className="text-gray-300">
          {item.product.name || "Product Unavailable"} × {item.quantity}
        </span>
        <span className="text-gray-400">₦{(item.price || 0).toFixed(2)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-emerald-400">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-emerald-400 mb-6">
          Your Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400">
                        Order #{order._id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-400">
                        Placed{" "}
                        {formatDistance(new Date(order.createdAt), new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center mt-2 sm:mt-0">
                      {getStatusIcon(order.status)}
                      <span className="ml-2 text-sm text-gray-300">
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-medium text-emerald-400 mb-2">
                      Items
                    </h3>
                    <div className="space-y-2">
                      {order.items?.map((item) => renderOrderItem(item)) || (
                        <p className="text-gray-400">No items found</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-700 mt-4 pt-4">
                    <h3 className="text-lg font-medium text-emerald-400 mb-2">
                      Delivery Address
                    </h3>
                    <div className="text-gray-300">
                      <p>{order.shippingAddress?.street || "N/A"}</p>
                      <p>{order.shippingAddress?.city || "N/A"}</p>
                      <p>{order.shippingAddress?.state || "N/A"}</p>
                      <p>{order.shippingAddress?.postalCode || "N/A"}</p>
                      <p>{order.shippingAddress?.country || "N/A"}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 mt-4 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-emerald-400">
                        Total
                      </span>
                      <span className="text-lg font-medium text-emerald-400">
                        ₦{(order.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrdersPage;
