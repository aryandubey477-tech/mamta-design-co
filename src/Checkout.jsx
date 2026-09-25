import { useNavigate } from "react-router-dom";

function Checkout({
  cart,
  cartTotal,
  customer,
  setCustomer,
  onPlaceOrder,
}) {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        <button
          className="product-back"
          onClick={() => navigate("/")}
        >
          ← BACK TO SHOP
        </button>

        <div className="checkout-form">

          <p className="section-label">CHECKOUT</p>

          <h1>Complete Your Order</h1>

          {/* CONTACT INFORMATION */}
          <div className="checkout-section">
            <h2>Contact Information</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={customer.name}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  name: e.target.value,
                })
              }
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  phone: e.target.value,
                })
              }
            />

            <input
              type="email"
              placeholder="Email Address"
              value={customer.email}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  email: e.target.value,
                })
              }
            />
          </div>

          {/* DELIVERY ADDRESS */}
          <div className="checkout-section">
            <h2>Delivery Address</h2>

            <input
              type="text"
              placeholder="House / Flat / Building"
              value={customer.address}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  address: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Street / Area"
              value={customer.area}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  area: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="City"
              value={customer.city}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  city: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="State"
              value={customer.state}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  state: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="PIN Code"
              value={customer.pincode}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  pincode: e.target.value,
                })
              }
            />
          </div>

          {/* PAYMENT */}
          <div className="checkout-section">
            <h2>Payment Method</h2>

            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={customer.payment === "cod"}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    payment: e.target.value,
                  })
                }
              />
              Cash on Delivery
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="online"
                checked={customer.payment === "online"}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    payment: e.target.value,
                  })
                }
              />
              Online Payment
            </label>
          </div>

         <button
  className="place-order-button"
  onClick={async () => {
    if (
      !customer.name ||
      !customer.phone ||
      !customer.email ||
      !customer.address ||
      !customer.area ||
      !customer.city ||
      !customer.state ||
      !customer.pincode
    ) {
      alert("Please fill in all your details before placing the order.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer,
          items: cart,
          total: cartTotal,
          payment: customer.payment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order failed");
      }

    console.log("Order saved:", data);
    console.log("ORDER ITEMS:", cart);

sessionStorage.setItem(
  "lastOrder",
  JSON.stringify({
    customer,
    items: cart,
    total: cartTotal,
    payment: customer.payment,
  })
);

onPlaceOrder();
    } catch (error) {
      console.error("Order error:", error);
      alert("Unable to place your order. Please try again.");
    }
  }}
>
  PLACE ORDER
</button>

        </div>

        {/* ORDER SUMMARY */}
        <div className="checkout-summary">

          <p className="section-label">ORDER SUMMARY</p>

          <h2>Your Bag</h2>

          {cart.length === 0 ? (
            <p>Your bag is empty.</p>
          ) : (
            cart.map((item) => (
              <div
                className="checkout-item"
                key={`${item.id}-${item.selectedSize || "default"}`}
              >
                <div>
                  <strong>{item.name}</strong>

                  {item.selectedSize && (
                    <small>
                      Size: {item.selectedSize}
                    </small>
                  )}

                  <small>
                    Qty: {item.quantity}
                  </small>
                </div>

                <strong>
                  {formatPrice(item.price * item.quantity)}
                </strong>
              </div>
            ))
          )}

          <div className="checkout-total">
            <span>Total</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Checkout;