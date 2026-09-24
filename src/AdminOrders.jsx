import { useEffect, useState } from "react";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/orders`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
        }
      })
      .catch((error) => {
        console.error("Unable to fetch orders:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN");
  };

  if (loading) {
    return (
      <div className="admin-orders-page">
        <h1>Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">

      <div className="admin-orders-header">
        <div>
          <p>MAMTA DESIGN CO.</p>
          <h1>Orders</h1>
        </div>

        <span>
          {orders.length} Orders
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="admin-empty">
          <h2>No orders yet.</h2>
          <p>New customer orders will appear here.</p>
        </div>
      ) : (
        <div className="admin-orders-list">

          {orders.map((order) => (
            <div
              className="admin-order-card"
              key={order._id}
            >

              <div className="admin-order-main">

                <div>
                  <small>ORDER</small>
                  <h3>
                    #{order._id.slice(-6).toUpperCase()}
                  </h3>
                </div>

                <div>
                  <small>CUSTOMER</small>
                  <strong>
                    {order.customer?.name || "—"}
                  </strong>
                </div>

                <div>
                  <small>PHONE</small>
                  <strong>
                    {order.customer?.phone || "—"}
                  </strong>
                </div>

                <div>
                  <small>TOTAL</small>
                  <strong>
                    {formatPrice(order.total)}
                  </strong>
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                >
                  VIEW ORDER
                </button>

              </div>

              <div className="admin-order-date">
                {formatDate(order.createdAt)}
              </div>

            </div>
          ))}

        </div>
      )}

      {selectedOrder && (
        <div
          className="admin-order-overlay"
          onClick={() => setSelectedOrder(null)}
        >

          <div
            className="admin-order-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              className="admin-order-close"
              onClick={() => setSelectedOrder(null)}
            >
              ×
            </button>

            <p className="admin-modal-label">
              ORDER DETAILS
            </p>

            <h2>
              #{selectedOrder._id.slice(-6).toUpperCase()}
            </h2>

            <section>
              <h3>Customer</h3>

              <p>
                <strong>Name:</strong>{" "}
                {selectedOrder.customer?.name || "—"}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {selectedOrder.customer?.phone || "—"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {selectedOrder.customer?.email || "—"}
              </p>
            </section>

            <section>
              <h3>Delivery</h3>

              <p>
                {selectedOrder.customer?.address || "—"}
              </p>

              <p>
                {selectedOrder.customer?.area || ""}
              </p>

              <p>
                {selectedOrder.customer?.city || "—"},{" "}
                {selectedOrder.customer?.state || "—"}{" "}
                {selectedOrder.customer?.pincode || ""}
              </p>
            </section>

            <section>
              <h3>Selected Items</h3>

              {selectedOrder.items?.map((item, index) => (
                <div
                  className="admin-item"
                  key={`${item.id}-${index}`}
                >
                  <div>
                    <strong>{item.name}</strong>

                    <p>
                      {item.category || "Product"}
                      {item.selectedSize
                        ? ` · Size ${item.selectedSize}`
                        : ""}
                    </p>
                  </div>

                  <div>
                    <strong>
                      × {item.quantity}
                    </strong>

                    <p>
                      {formatPrice(
                        item.price * item.quantity
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            <section className="admin-order-total">
              <span>Order Total</span>

              <strong>
                {formatPrice(selectedOrder.total)}
              </strong>
            </section>

            <section>
              <h3>Payment</h3>

              <p>
                {selectedOrder.payment === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>
            </section>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminOrders;