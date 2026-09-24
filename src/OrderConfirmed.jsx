import { useNavigate } from "react-router-dom";

function OrderConfirmed({ customer, cartTotal }) {
  const navigate = useNavigate();

  const savedOrder = sessionStorage.getItem("lastOrder");

  const order = savedOrder
    ? JSON.parse(savedOrder)
    : {
        customer,
        total: cartTotal,
        payment: customer?.payment || "cod",
        items: [],
      };

  const orderCustomer = order.customer || {};
  const orderTotal = order.total || 0;
  const orderItems = order.items || [];

  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  return (
    <div className="order-confirmed-page">
      <div className="order-confirmed-container">

        <p className="order-confirmed-brand">
          MAMTA DESIGN CO.
        </p>

        <div className="order-confirmed-check">
          ✓
        </div>

        <h1>
          Order
          <br />
          Confirmed.
        </h1>

        <p className="order-confirmed-message">
          Thank you, {orderCustomer.name || "Customer"}.
          <br />
          Your order has been successfully received.
        </p>

        {/* ORDERED ITEMS */}
        {orderItems.length > 0 && (
          <div className="order-confirmed-items">

            <p className="order-confirmed-items-title">
              YOUR ORDER
            </p>

            {orderItems.map((item, index) => (
              <div
                className="order-confirmed-item"
                key={`${item.id}-${index}`}
              >

                <div className="order-confirmed-item-image">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                    />
                  ) : (
                    <div>No Image</div>
                  )}
                </div>

                <div className="order-confirmed-item-info">

                  <h3>{item.name}</h3>

                  {item.selectedSize && (
                    <p>
                      Size: {item.selectedSize}
                    </p>
                  )}

                  <p>
                    Quantity: {item.quantity || 1}
                  </p>

                </div>

                <strong className="order-confirmed-item-price">
                  {formatPrice(
                    Number(item.price || 0) *
                    Number(item.quantity || 1)
                  )}
                </strong>

              </div>
            ))}

          </div>
        )}

        {/* ORDER DETAILS */}
        <div className="order-confirmed-details">

          <div>
            <span>PAYMENT</span>
            <strong>
              {order.payment === "cod"
                ? "Cash on Delivery"
                : "Online Payment"}
            </strong>
          </div>

          <div>
            <span>DELIVERY TO</span>
            <strong>
              {orderCustomer.city || "—"},{" "}
              {orderCustomer.state || "—"}
            </strong>
          </div>

          <div>
            <span>ORDER TOTAL</span>
            <strong>
              {formatPrice(orderTotal)}
            </strong>
          </div>

        </div>

        <button
          className="order-confirmed-button"
          onClick={() => {
            sessionStorage.removeItem("lastOrder");
            navigate("/");
            window.scrollTo(0, 0);
          }}
        >
          CONTINUE SHOPPING
        </button>

      </div>
    </div>
  );
}

export default OrderConfirmed;