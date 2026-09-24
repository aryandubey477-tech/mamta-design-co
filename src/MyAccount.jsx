import { useEffect, useState } from "react";

function MyAccount() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("mamtaUser");
    
if (savedUser) {
  const parsedUser = JSON.parse(savedUser);

  setUser(parsedUser);

  setOrdersLoading(true);

fetch(
  `${import.meta.env.VITE_API_URL}/api/orders/user/${encodeURIComponent(parsedUser.email)}`
)
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
      setOrdersLoading(false);
    });
}

  }, []);

  if (!user) {
    return (
      <div className="account-page">
        <div className="account-container">
          <p className="account-brand">MAMTA DESIGN CO.</p>

          <h1>Please sign in.</h1>

          <p>
            Sign in to view your account and orders.
          </p>

          <button
            className="account-button"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            SIGN IN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-container">

        <p className="account-brand">
          MAMTA DESIGN CO.
        </p>

        <p className="account-label">
          MY ACCOUNT
        </p>

        <h1>
          Hello, {user.name}.
        </h1>

        <div className="account-details">

          <div>
            <span>NAME</span>
            <strong>{user.name}</strong>
          </div>

          <div>
            <span>EMAIL</span>
            <strong>{user.email}</strong>
          </div>

          <div>
            <span>PHONE</span>
            <strong>{user.phone}</strong>
          </div>

        </div>

        <div className="account-orders">

  <div className="account-orders-header">
    <p className="account-label">MY ORDERS</p>
  </div>

  {ordersLoading ? (
    <p className="account-orders-message">
      Loading your orders...
    </p>
  ) : orders.length === 0 ? (
    <p className="account-orders-message">
      You haven't placed any orders yet.
    </p>
  ) : (
    <div className="account-order-list">

      {orders.map((order) => (
        <div
          className="account-order-card"
          key={order._id}
        >

          <div className="account-order-top">
            <div>
              <span>ORDER</span>
              <strong>
                #{order._id.slice(-6).toUpperCase()}
              </strong>
            </div>

            <div>
              <span>DATE</span>
              <strong>
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </strong>
            </div>

            <div>
              <span>TOTAL</span>
              <strong>
                ₹{Number(order.total || 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div className="account-order-items">

            {order.items?.map((item, index) => (
              <div
                className="account-order-item"
                key={`${item.id}-${index}`}
              >

                <div>
                  <strong>{item.name}</strong>

                  <p>
                    {item.selectedSize
                      ? `Size ${item.selectedSize} · `
                      : ""}
                    Quantity {item.quantity}
                  </p>
                </div>

                <strong>
                  ₹{Number(
                    item.price * item.quantity
                  ).toLocaleString("en-IN")}
                </strong>

              </div>
            ))}

          </div>

          <div className="account-order-payment">
            <span>PAYMENT</span>

            <strong>
              {order.payment === "cod"
                ? "Cash on Delivery"
                : "Online Payment"}
            </strong>
          </div>

        </div>
      ))}

    </div>
  )}

</div>


<div className="account-actions">

  <button
    className="account-button"
    onClick={() => {
      localStorage.removeItem("mamtaUser");
      window.location.href = "/";
    }}
  >
    SIGN OUT
  </button>

</div>

      </div>
    </div>
  );
}

export default MyAccount;