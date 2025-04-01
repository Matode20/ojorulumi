import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { formatDistance } from "date-fns";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
} from "lucide-react";

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/order/admin");

      console.log("Orders response:", response.data); // Debug log

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="text-yellow-500" />;
      case "processing":
        return <Package className="text-blue-500" />;
      case "shipped":
        return <Truck className="text-purple-500" />;
      case "delivered":
        return <CheckCircle className="text-green-500" />;
      case "cancelled":
        return <XCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.patch(`/order/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Refresh orders after update
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) return <div className="text-center">Loading orders...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="bg-gray-800 rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {orders.map((order) => (
              <>
                <tr key={order._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleOrderDetails(order._id)}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <MapPin size={20} />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className="ml-2 text-sm text-gray-300">
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ₦{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDistance(new Date(order.createdAt), new Date(), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order._id, e.target.value)
                      }
                      className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
                {expandedOrder === order._id && (
                  <tr className="bg-gray-900">
                    <td colSpan="7" className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                        <div>
                          <h4 className="font-semibold text-emerald-400 mb-2">
                            Delivery Address
                          </h4>
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}</p>
                          <p>{order.shippingAddress.state}</p>
                          <p>{order.shippingAddress.postalCode}</p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-emerald-400 mb-2">
                            Order Items
                          </h4>
                          {order.items.map((item) => (
                            <div
                              key={item._id}
                              className="flex justify-between mb-2"
                            >
                              <span>{item.product.name}</span>
                              <span>x{item.quantity}</span>
                              <span>₦{item.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTab;
