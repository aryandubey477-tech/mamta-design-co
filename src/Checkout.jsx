import React from "react";
import { useNavigate } from "react-router-dom";

function Checkout({
  cart,
  cartTotal,
  customer,
  setCustomer,
  onPlaceOrder,
}) {
  const navigate = useNavigate();
  const [processing, setProcessing] = React.useState(false);

  const formatPrice = (price) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const saveOrderAndContinue = (orderData) => {
    sessionStorage.setItem("lastOrder", JSON.stringify(orderData));
    onPlaceOrder();
  };

  const handlePlaceOrder = async () => {
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

    if (!cart.length) {
      alert("Your bag is empty.");
      return;
    }

    setProcessing(true);

    try {
      if (customer.payment === "cod") {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customer,
              items: cart,
              total: cartTotal,
              payment: "cod",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Order failed");
        }

        saveOrderAndContinue({
          customer: {
            ...customer,
            payment: "cod",
          },
          items: cart,
          total: cartTotal,
          payment: "cod",
        });
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay Checkout. Please try again."
        );
      }

      

      const orderResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: cartTotal,
          }),
        }
      );

      const orderData = await orderResponse.json();

if (!orderResponse.ok || !orderData.success) {
  throw new Error(
    orderData.message || "Unable to create payment order."
  );
}

    const razorpayOrder = orderData.order;


      
      console.log("RAZORPAY ORDER DATA:", orderData);

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(
          orderData.message || "Unable to create payment order."
        );
      }

      

      const options = {
        key: orderData.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "MAMTA DESIGN CO.",
        description: "Chaniya Choli Order",
        order_id: razorpayOrder.id,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        notes: {
          customer_name: customer.name,
          city: customer.city,
        },
        theme: {
          color: "#4B352A",
        },
        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/api/payment/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  customer,
                  items: cart,
                  total: cartTotal,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            saveOrderAndContinue({
              customer: {
                ...customer,
                payment: "online",
              },
              items: cart,
              total: cartTotal,
              payment: "online",
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
            });
          } catch (error) {
            console.error("Payment verification error:", error);
            alert(
              "Payment was completed, but order verification failed. Please contact MAMTA DESIGN CO. support."
            );
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        setProcessing(false);
        alert(
          response.error?.description ||
            "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        error.message ||
          "Unable to place your order. Please try again."
      );
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button
          className="product-back"
          onClick={() => navigate("/")}
          disabled={processing}
        >
          ← BACK TO SHOP
        </button>

        <div className="checkout-form">
          <p className="section-label">CHECKOUT</p>
          <h1>Complete Your Order</h1>

          <div className="checkout-section">
            <h2>Contact Information</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email Address"
              value={customer.email}
              onChange={(e) =>
                setCustomer({ ...customer, email: e.target.value })
              }
            />
          </div>

          <div className="checkout-section">
            <h2>Delivery Address</h2>

            <input
              type="text"
              placeholder="House / Flat / Building"
              value={customer.address}
              onChange={(e) =>
                setCustomer({ ...customer, address: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Street / Area"
              value={customer.area}
              onChange={(e) =>
                setCustomer({ ...customer, area: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="City"
              value={customer.city}
              onChange={(e) =>
                setCustomer({ ...customer, city: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="State"
              value={customer.state}
              onChange={(e) =>
                setCustomer({ ...customer, state: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="PIN Code"
              value={customer.pincode}
              onChange={(e) =>
                setCustomer({ ...customer, pincode: e.target.value })
              }
            />
          </div>

          <div className="checkout-section">
            <h2>Payment Method</h2>

           

            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="online"
                checked={customer.payment === "online"}
                onChange={(e) =>
                  setCustomer({ ...customer, payment: e.target.value })
                }
                disabled={processing}
              />
              Online Payment
            </label>
          </div>

          <button
            className="place-order-button"
            onClick={handlePlaceOrder}
            disabled={processing}
          >
            {processing
              ? "PROCESSING..."
              : customer.payment === "online"
              ? "PAY NOW"
              : "PLACE ORDER"}
          </button>
        </div>

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
                    <small>Size: {item.selectedSize}</small>
                  )}

                  <small>Qty: {item.quantity}</small>
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
