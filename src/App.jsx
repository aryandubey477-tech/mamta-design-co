import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./App.css";

import Checkout from "./Checkout.jsx";
import OrderConfirmed from "./OrderConfirmed";
import AdminOrders from "./AdminOrders.jsx";
import AdminProducts from "./AdminProducts.jsx";
import AdminLogin from "./AdminLogin.jsx";
import Login from "./Login.jsx";
import MyAccount from "./MyAccount.jsx";
import ProductDetail from "./ProductDetail.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import ResetPassword from "./ResetPassword.jsx";


// ==========================================
// CUSTOMER HELP & SUPPORT CONFIGURATION
// Configure support contact details for MAMTA DESIGN CO.
// ==========================================
export const SUPPORT_CONFIG = {
  email: "support@mamtadesignco.com", // Business support email
  whatsappNumber: "", // Set WhatsApp number in international format e.g. "919876543210" (empty = hidden)
  whatsappMessage: "Hello MAMTA DESIGN CO., I have an inquiry regarding Chaniya Choli.",
};

const fallbackProducts = [];

function App() {
const navigate = useNavigate();
const location = useLocation();

const [products, setProducts] = useState(fallbackProducts);  
const [activeCategory, setActiveCategory] = useState("All");

useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/api/products`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setProducts(data.products);
      }
    })
    .catch((error) => {
      console.error("Failed to load products:", error);
    });
}, []);

  const [showAllProducts, setShowAllProducts] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
  const savedUser = localStorage.getItem("mamtaUser");

  if (savedUser) {
    setLoggedInUser(JSON.parse(savedUser));
  }
}, []);

  const [customer, setCustomer] = useState({
  name: "",
  phone: "",
  email: "",
  address: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  payment: "online",
});

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const openProduct = (product) => {
    navigate(`/product/${product._id || product.id}`);
  };

  const closeProduct = () => {
    navigate("/");
  };

  // Categories & Collection filters
  const categories = ["All", "Navratri", "Festive"];

  const filteredProducts =
    activeCategory === "All"
      ? products
      : activeCategory === "Chaniya Choli"
      ? products.filter((p) => p.category === "Chaniya Choli")
      : products.filter(
          (p) =>
            p.collection?.toLowerCase() === activeCategory.toLowerCase() ||
            p.category?.toLowerCase() === activeCategory.toLowerCase()
        );

  const selectCollection = (collectionName) => {
    setActiveCategory(collectionName);
    setShowAllProducts(true);
    const shopSection = document.getElementById("shop");
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const addToCart = (product, addQty = 1) => {
    const prodId = product._id || product.id;
    const qtyToAdd = addQty || product.quantity || 1;

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => (item.id === prodId || item._id === prodId)
      );

      if (existing) {
        return currentCart.map((item) =>
          (item.id === prodId || item._id === prodId)
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          id: prodId,
          _id: prodId,
          quantity: qtyToAdd,
        },
      ];
    });

    setCartOpen(true);
  };

  const updateQuantity = (id, selectedSize, change) => {
    // Handle both updateQuantity(id, change) and updateQuantity(id, selectedSize, change)
    let qtyChange = change;
    let sizeFilter = selectedSize;

    if (typeof selectedSize === "number" && change === undefined) {
      qtyChange = selectedSize;
      sizeFilter = null;
    }

    setCart((currentCart) =>
      currentCart
        .map((item) => {
          const matchId = item.id === id || item._id === id;
          const matchSize = !sizeFilter || item.selectedSize === sizeFilter;

          if (matchId && matchSize) {
            return {
              ...item,
              quantity: item.quantity + qtyChange,
            };
          }

          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id, selectedSize = null) => {
    setCart((currentCart) =>
      currentCart.filter((item) => {
        const matchesId = item.id === id || item._id === id;
        if (selectedSize && item.selectedSize) {
          return !(matchesId && item.selectedSize === selectedSize);
        }
        return !matchesId;
      })
    );
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const formatPrice = (price) =>
    `₹${price.toLocaleString("en-IN")}`;

  if (location.pathname === "/order-confirmed") {
  return (
    <OrderConfirmed
      customer={customer}
      cartTotal={cartTotal}
    />
  );
}

if (location.pathname === "/admin/login") {
  return <AdminLogin />;
}



if (location.pathname === "/admin/products") {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    return <AdminLogin />;
  }

  return <AdminProducts />;
}

if (location.pathname === "/admin/orders") {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    return <AdminLogin />;
  }

  return <AdminOrders />;
}

if (location.pathname === "/login") {
  return <Login />;
}

if (location.pathname === "/forgot-password") {
  return <ForgotPassword />;
}

if (location.pathname.startsWith("/reset-password/")) {
  return <ResetPassword />;
}

if (location.pathname === "/account") {
  return <MyAccount />;
}

if (location.pathname.startsWith("/product/")) {
  const productId = location.pathname.replace("/product/", "").split("/")[0].split("?")[0];
  return (
    <ProductDetail
      productId={productId}
      addToCart={addToCart}
      setCartOpen={setCartOpen}
      cartCount={cartCount}
    />
  );
}


if (location.pathname === "/checkout") {
  return (
    <Checkout
      cart={cart}
      cartTotal={cartTotal}
      customer={customer}
      setCustomer={setCustomer}
      onPlaceOrder={() => {
        setCart([]);
        setCartOpen(false);
        navigate("/order-confirmed");
      }}
    />
  );
}

return (
    <div className="site">

      
      {/* HERO */}

      <main>

       <section className="hero">

  <div className="hero-image">
    <img
      src="/hero.png"
      alt="MAMTA DESIGN CO. festive collection"
    />
  </div>

  <div className="hero-overlay"></div>

  <div className="hero-top-bar">
    ✦ THE FESTIVE EDIT · NAVRATRI 2026 · CRAFTED IN GUJARAT ✦
  </div>

  <div className="hero-navigation">

    <a href="#" className="hero-logo">
      <span>MAMTA</span>
      <small>DESIGN CO.</small>
    </a>

    <nav className="hero-nav-links">
  <a href="#collections">Collections</a>
  <a
    href="#shop"
    onClick={(e) => {
      e.preventDefault();
      selectCollection("All");
    }}
  >
    Chaniya Choli
  </a>
  <a href="#studio">The Studio</a>
  <a
    href="#support"
    onClick={(e) => {
      e.preventDefault();
      document.getElementById("support")?.scrollIntoView({ behavior: "smooth" });
    }}
  >
    Help &amp; Support
  </a>

  <button
    type="button"
    onClick={() => navigate("/account")}
    className="hero-account-link"
  >
    Account
  </button>
</nav>

    <button
      className="hero-bag"
      onClick={() => setCartOpen(true)}
    >
      BAG ({cartCount})
    </button>

  </div>

  <div className="hero-content">

    <p className="hero-eyebrow">
      THE ART OF GUJARATI CRAFT
    </p>

    <h1>
  The Last
  <br />
  <em>Dance Drop.</em>
</h1>

    <p className="hero-description">
      Chaniya Choli inspired by
      <br />
      Gujarat's timeless celebrations.
    </p>

    <a
      href="#shop"
      className="hero-button"
    >
      SHOP THE COLLECTION →
    </a>

  </div>

  <div className="hero-bottom">

    <span>
      HANDCRAFTED IN GUJARAT
    </span>

    <span>
      SCROLL TO EXPLORE ↓
    </span>

  </div>

</section>


        {/* INTRO */}

        <section className="intro">

          <p className="section-label">
            MAMTA DESIGN CO.
          </p>

          <h2>
            Tradition,
            <br />
            Reimagined.
          </h2>

          <p className="intro-text">
            A celebration of Gujarati craftsmanship through
            contemporary silhouettes and intricate details made for the moments that matter.
          </p>

        </section>


        {/* COLLECTIONS */}

<section className="collections" id="collections">

  <div className="section-heading">

    <div>
      <p className="section-label">
        DISCOVER MAMTA
      </p>

      <h2>
        Collections
      </h2>
    </div>

    <p className="collection-intro">
      Pieces created for celebrations,
      <br />
      ceremonies and unforgettable evenings.
    </p>

  </div>


  <div className="collection-grid">

    <article
      className="collection-card collection-one"
      style={{ cursor: "pointer" }}
      onClick={() => selectCollection("Navratri")}
    >

      <div className="collection-number">
        01
      </div>

      <div className="card-content">
        <p>THE FESTIVE EDIT</p>

        <h3>
          Navratri
        </h3>

        <span>
          EXPLORE COLLECTION →
        </span>
      </div>

    </article>


    <article className="collection-card collection-two">

      <div className="collection-number">
        02
      </div>
           
        <p className="collection-label">THE BRIDAL EDIT</p>

        <h2>Bridal</h2>

        <div className="collection-coming-soon">
          COMING SOON →
         </div>

    </article>


    <article
      className="collection-card collection-three"
      style={{ cursor: "pointer" }}
      onClick={() => selectCollection("Festive")}
    >

      <div className="collection-number">
        03
      </div>

      <div className="card-content">
        <p>THE CELEBRATION EDIT</p>

        <h3>
          Festive
        </h3>

        <span>
          EXPLORE COLLECTION →
        </span>
      </div>

    </article>

  </div>

</section>

  
        {/* SHOP */}

        <section
          className="shop"
          id="shop"
        >

          <div className="section-heading">

            <div>
              <p className="section-label">
  THE MAMTA EDIT
</p>

<h2>
  Curated for
  <br />
  celebration.
</h2>
            </div>

          </div>


          <div className="category-tabs">

            {categories.map((category) => (
              <button
                key={category}
                className={
                  activeCategory === category
                    ? "category-tab active"
                    : "category-tab"
                }
                onClick={() =>
                  setActiveCategory(category)
                }
              >
                {category}
              </button>
            ))}

          </div>


          <div className="product-grid">
{(showAllProducts
  ? filteredProducts
  : filteredProducts.slice(0, 4)
).map((product) => (


             <article
  className="product-card"
  key={product._id}
  onClick={() => navigate(`/product/${product._id}`)}
>

                <div className="product-image">

                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  <button
  className="quick-add"
  onClick={(event) => {
    event.stopPropagation();
    const hasOffer =
      product.offerPrice !== null &&
      product.offerPrice !== undefined &&
      product.offerPrice !== "" &&
      Number(product.offerPrice) > 0 &&
      Number(product.offerPrice) < Number(product.price);
    addToCart({
      ...product,
      price: hasOffer ? Number(product.offerPrice) : Number(product.price),
    });
  }}
>
  ADD TO BAG
</button>

                </div>

                <div className="product-info">

                  <div>

                    <p className="product-category">
                      {product.category}
                    </p>

                    <h3>
                      {product.name}
                    </h3>

                  </div>

                  <strong>
                    {formatPrice(product.price)}
                  </strong>

                </div>

              </article>

            ))}

         </div>

{!showAllProducts && filteredProducts.length > 4 && (
  <div className="shop-view-all">
    <button
      type="button"
      className="dark-button"
      onClick={() => {
        setShowAllProducts(true);
        document
          .getElementById("shop")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }}
    >
      VIEW ALL CHANIYA CHOLI →
    </button>
  </div>
)}

</section>


        {/* STORY */}

        <section
          className="story"
          id="studio"
        >

          <div className="story-image">

            <div className="story-image-text">
              MAMTA
            </div>

          </div>

          <div className="story-content">

            <p className="section-label">
              THE STUDIO
            </p>

            <h2>
              Where fabric
              <br />
              becomes art.
            </h2>

            <p>
              From the mirror work of Kutch to the colours
              of Gujarat's festive nights, our designs draw
              from the traditions that make Indian
              craftsmanship extraordinary.
            </p>

            <p>
              Every piece is created with attention to
              silhouette, detail and the woman who will
              wear it.
            </p>

            <a
              href="#collections"
              className="text-link"
            >
              EXPLORE COLLECTIONS →
            </a>

          </div>

        </section>


        {/* CUSTOMER HELP & SUPPORT */}

        <section
          className="support-section"
          id="support"
        >

          <div className="support-container">

            <p className="section-label">
              MAMTA DESIGN CO. · CLIENT SERVICE
            </p>

            <h2>
              Help &amp;
              <br />
              Support.
            </h2>

            <p className="support-intro">
              Our studio team is available to assist with inquiries regarding
              artisanal craft, styling, Free Size fit, custom requests, and order assistance.
            </p>

            <div className="support-channels">

              <a
                href={`mailto:${SUPPORT_CONFIG.email}?subject=Customer%20Support%20Inquiry%20-%20MAMTA%20DESIGN%20CO.`}
                className="support-channel-card"
              >
                <div className="support-card-icon">
                  ✉
                </div>
                <div className="support-card-text">
                  <span className="support-card-tag">EMAIL US</span>
                  <strong>{SUPPORT_CONFIG.email}</strong>
                  <small>Direct studio correspondence</small>
                </div>
                <span className="support-card-arrow">→</span>
              </a>

              {SUPPORT_CONFIG.whatsappNumber ? (
                <a
                  href={`https://wa.me/${SUPPORT_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                    SUPPORT_CONFIG.whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-channel-card"
                >
                  <div className="support-card-icon">
                    💬
                  </div>
                  <div className="support-card-text">
                    <span className="support-card-tag">WHATSAPP US</span>
                    <strong>Chat with Studio</strong>
                    <small>Instant styling &amp; order assistance</small>
                  </div>
                  <span className="support-card-arrow">→</span>
                </a>
              ) : (
                <div className="support-channel-card support-channel-card-info">
                  <div className="support-card-icon">
                    ✦
                  </div>
                  <div className="support-card-text">
                    <span className="support-card-tag">STUDIO CARE</span>
                    <strong>Handcrafted in Gujarat</strong>
                    <small>Dedicated artisan support</small>
                  </div>
                </div>
              )}

            </div>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-brand">

          <span>MAMTA</span>

          <p>
            DESIGN CO. · CHANIYA CHOLI
          </p>

        </div>

        <div className="footer-links">
          <a href="#collections">Collections</a>
          <a
            href="#shop"
            onClick={(e) => {
              e.preventDefault();
              selectCollection("All");
            }}
          >
            Shop
          </a>
          <a href="#studio">The Studio</a>
          <a
            href="#support"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("support")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Help &amp; Support
          </a>
        </div>

        <div className="footer-bottom">

          <span>
            © 2026 MAMTA DESIGN CO.
          </span>

          <span>
            CRAFTED IN GUJARAT
          </span>

          <span>
            INSTAGRAM ↗
          </span>

        </div>

      </footer>

      


{/* ORDER CONFIRMATION */}

{orderPlaced && (
  <section className="order-confirmation">

    <div className="confirmation-content">

      <p className="section-label">
        MAMTA DESIGN CO.
      </p>

      <div className="confirmation-icon">
        ✓
      </div>

      <h1>
        Order
        <br />
        Confirmed.
      </h1>

      <p className="confirmation-message">
        Thank you, {customer.name}.
        <br />
        Your order has been successfully received.
      </p>

      <div className="confirmation-details">

        <div>
          <span>PAYMENT</span>
          <strong>
            {customer.payment === "cod"
              ? "Cash on Delivery"
              : "Online Payment"}
          </strong>
        </div>

        <div>
          <span>DELIVERY TO</span>
          <strong>
            {customer.city}, {customer.state}
          </strong>
        </div>

        <div>
          <span>ORDER TOTAL</span>
          <strong>
            {formatPrice(cartTotal)}
          </strong>
        </div>

      </div>

      <button
        className="confirmation-button"
        onClick={() => {
          setOrderPlaced(false);
          setCart([]);
          setCheckoutOpen(false);
        }}
      >
        CONTINUE SHOPPING
      </button>

    </div>

  </section>
)}



      {/* CART DRAWER */}

      {cartOpen && (

        <div
          className="cart-overlay"
          onClick={() => setCartOpen(false)}
        >

          <aside
            className="cart-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="cart-header">

              <div>
                <p className="section-label">
                  YOUR SHOPPING BAG
                </p>

                <h2>
                  Bag ({cartCount})
                </h2>
              </div>

              <button
                className="close-cart"
                onClick={() =>
                  setCartOpen(false)
                }
              >
                ×
              </button>

            </div>


            {cart.length === 0 ? (

              <div className="empty-cart">

                <p>
                  Your bag is currently empty.
                </p>

                <button
                  onClick={() =>
                    setCartOpen(false)
                  }
                >
                  CONTINUE SHOPPING
                </button>

              </div>

            ) : (

              <>

                <div className="cart-items">

                  {cart.map((item) => (

                    <div
                      className="cart-item"
                      key={item.id}
                    >

                      <img
                        src={item.image}
                        alt={item.name}
                      />

                      <div className="cart-item-details">

                        <h3>
                          {item.name}
                        </h3>

                        <p>
                          {formatPrice(item.price)}
                        </p>

                        {item.selectedSize && item.selectedSize !== "Free Size" && (
                          <small>
                            Size: {item.selectedSize}
                          </small>
                        )}

                       <div className="quantity">

  <button
    onClick={() =>
      updateQuantity(
        item.id || item._id,
        -1
      )
    }
  >
    −
  </button>

  <span>
    {item.quantity}
  </span>

  <button
    onClick={() =>
      updateQuantity(
        item.id || item._id,
        1
      )
    }
  >
    +
  </button>

</div>
                        <button
                          className="remove-item"
                          onClick={() =>
                            removeFromCart(item.id || item._id)
                          }
                        >
                          REMOVE
                        </button>

                      </div>

                    </div>

                  ))}

                </div>


                <div className="cart-summary">

                  <div>
                    <span>Subtotal</span>

                    <strong>
                      {formatPrice(cartTotal)}
                    </strong>
                  </div>

                  <p>
                    Shipping calculated at checkout.
                  </p>

                  <button
  type="button"
  className="checkout-button"
onClick={() => {
  setCartOpen(false);
  navigate("/checkout");
}}
>
  PROCEED TO CHECKOUT
</button>
  

                </div>

              </>

            )}

          </aside>

        </div>

      )}

    </div>
  );
}

export default App;