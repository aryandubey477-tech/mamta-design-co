import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   MAMTA DESIGN CO. — PRODUCT DETAIL PAGE (/product/:id)
   Luxury Gujarati Fashion Aesthetic
   - Free Size Chaniya Choli (no size selector)
   - 4–5 Photo Gallery with smooth thumbnail switching
   - Dynamic Offer Pricing & Offer Badge
   - Handcrafted Product Description (hidden if empty)
   - Return / Exchange Policy (hidden if empty)
   - Seamless integration with existing cart drawer & checkout
───────────────────────────────────────────────────────────── */

function ProductDetail({ productId, addToCart, setCartOpen, cartCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract ID from prop or URL
  const id =
    productId ||
    location.pathname.replace("/product/", "").split("/")[0].split("?")[0] ||
    "";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Gallery
  const [activeImage, setActiveImage] = useState("");

  // Selection
  const [quantity, setQuantity] = useState(1);
  const [addedMsg, setAddedMsg] = useState("");

  // ─── Fetch Product ───
  useEffect(() => {
    if (!id) {
      setError("Product link is missing or invalid.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

    fetch(`${apiUrl}/api/products/${id}`)
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (!res.ok) {
          if (contentType && contentType.includes("application/json")) {
            const errData = await res.json();
            throw new Error(errData.message || `Server error: ${res.status}`);
          }
          throw new Error(`Product not found (Status ${res.status}).`);
        }
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response format received from server.");
        }
        return res.json();
      })
      .then((data) => {
        if (!data.success || !data.product) {
          throw new Error(data.message || "Product not found.");
        }
        const prod = data.product;
        setProduct(prod);

        // Build gallery: prefer images[] array if available, fallback to single image
        const gallery =
          Array.isArray(prod.images) && prod.images.length > 0
            ? prod.images
            : prod.image
            ? [prod.image]
            : [];

        setActiveImage(gallery[0] || "");
      })
      .catch((err) => {
        console.error("ProductDetail load error:", err);
        setError(err.message || "Unable to load product.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Gallery images array
  const galleryImages =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [];

  // Price formatting
  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  // Offer check
  const hasOffer =
    product &&
    product.offerPrice !== null &&
    product.offerPrice !== undefined &&
    product.offerPrice !== "" &&
    Number(product.offerPrice) > 0 &&
    Number(product.offerPrice) < Number(product.price);

  // ─── Add to Bag ───
  const handleAddToBag = () => {
    if (!product) return;
    if (product.isSold) {
      alert("This exclusive one-of-one piece has already been acquired and is no longer available.");
      return;
    }

    const priceToUse = hasOffer
      ? Number(product.offerPrice)
      : Number(product.price);

    const cartItem = {
      id: product._id,
      _id: product._id,
      name: product.name,
      price: priceToUse,
      image: activeImage || product.image || galleryImages[0] || "",
      category: product.category || "Chaniya Choli",
      collection: product.collection,
      quantity,
    };

    addToCart(cartItem, quantity);

    setAddedMsg("ADDED TO YOUR BAG ✓");
    setTimeout(() => setAddedMsg(""), 3000);
  };

  // ─────── LOADING STATE ───────
  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Unveiling the piece...</p>
        <span style={styles.loadingSub}>MAMTA DESIGN CO.</span>
      </div>
    );
  }

  // ─────── ERROR STATE ───────
  if (error || !product) {
    return (
      <div style={styles.loadingWrapper}>
        <p style={styles.errorTitle}>Piece Not Found</p>
        <p style={styles.errorSub}>{error || "This piece is unavailable."}</p>
        <button style={styles.backBtnLarge} onClick={() => navigate("/")}>
          ← RETURN TO THE COLLECTION
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ── Top Navigation Bar ── */}
      <header style={styles.topbar}>
        <button style={styles.navBackBtn} onClick={() => navigate("/")}>
          <span style={styles.navArrow}>←</span> BACK TO COLLECTION
        </button>

        <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }} style={styles.brandLogo}>
          <span style={styles.brandTitle}>MAMTA</span>
          <span style={styles.brandSub}>DESIGN CO.</span>
        </a>

        <button
          style={styles.navBagBtn}
          onClick={() => setCartOpen(true)}
          aria-label="Open shopping bag"
        >
          BAG {cartCount > 0 ? `(${cartCount})` : ""}
        </button>
      </header>

      {/* ── Main Editorial Container ── */}
      <main style={styles.container}>
        <div style={styles.grid}>

          {/* ────── LEFT: PRODUCT GALLERY ────── */}
          <section style={styles.galleryColumn} aria-label="Product Photos">

            {/* Main Stage Image */}
            <div style={styles.mainImageFrame}>
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  style={styles.mainImage}
                />
              ) : (
                <div style={styles.noPhotoPlaceholder}>
                  <span>No photo available</span>
                </div>
              )}

              {/* Offer Badge Overlay */}
              {hasOffer && product.offerText && (
                <div style={styles.offerBadge}>
                  ✦ {product.offerText}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation (4–5 photos) */}
            {galleryImages.length > 1 && (
              <div style={styles.thumbnailStrip} role="tablist">
                {galleryImages.map((imgUrl, idx) => {
                  const isActive = activeImage === imgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`View photo ${idx + 1}`}
                      onClick={() => setActiveImage(imgUrl)}
                      style={{
                        ...styles.thumbnailBtn,
                        borderColor: isActive ? "#5D2428" : "#E5D4B2",
                        boxShadow: isActive
                          ? "0 4px 12px rgba(93, 36, 40, 0.25)"
                          : "none",
                        opacity: isActive ? 1 : 0.72,
                        transform: isActive ? "scale(1.03)" : "scale(1)",
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        style={styles.thumbnailImg}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* ────── RIGHT: PRODUCT INFORMATION ────── */}
          <section style={styles.infoColumn} aria-label="Product Details">

            {/* Collection & Category Eyebrow */}
            <div style={styles.eyebrowRow}>
              <span style={styles.eyebrowTag}>
                ✦ {product.collection.toUpperCase()} EDIT
              </span>
              <span style={styles.categoryDivider}>·</span>
              <span style={styles.categoryText}>{product.category}</span>
            </div>

            {/* Product Name */}
            <h1 style={styles.productTitle}>{product.name}</h1>

            {/* Price Presentation */}
            <div style={styles.priceContainer}>
              {hasOffer ? (
                <div style={styles.offerPriceBlock}>
                  <div style={styles.priceNumbers}>
                    <span style={styles.offerPriceValue}>
                      {fmt(product.offerPrice)}
                    </span>
                    <span style={styles.originalPriceStrikethrough}>
                      {fmt(product.price)}
                    </span>
                  </div>
                  {product.offerText && (
                    <div style={styles.offerInlineBadge}>
                      {product.offerText}
                    </div>
                  )}
                </div>
              ) : (
                <span style={styles.regularPriceValue}>
                  {fmt(product.price)}
                </span>
              )}
              <span style={styles.taxNotice}>Taxes included · Free domestic shipping</span>
            </div>

            <div style={styles.divider} />

            {/* Quantity Selector */}
            <div style={styles.quantitySection}>
              <label style={styles.metaLabel}>QUANTITY</label>
              <div style={styles.quantityControl}>
                <button
                  type="button"
                  style={styles.qtyAdjustBtn}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span style={styles.qtyDisplay}>{quantity}</span>
                <button
                  type="button"
                  style={styles.qtyAdjustBtn}
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Bag CTA */}
            <div style={styles.ctaWrapper}>
              {product.isSold ? (
                <div style={{ textAlign: "center", width: "100%" }}>
                  <button
                    type="button"
                    style={{
                      ...styles.addToBagBtn,
                      background: "#5a433b",
                      borderColor: "#5a433b",
                      cursor: "not-allowed",
                      opacity: 0.85,
                    }}
                    disabled
                  >
                    SOLD OUT · ARCHIVE PIECE
                  </button>
                  <p style={{ marginTop: "12px", fontSize: "12px", color: "#8b7568", fontStyle: "italic" }}>
                    ✦ This exclusive one-of-one handcrafted piece has been acquired and is no longer available.
                  </p>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    style={styles.addToBagBtn}
                    onClick={handleAddToBag}
                  >
                    ADD TO BAG
                  </button>

                  {addedMsg && (
                    <div style={styles.addedToast}>
                      {addedMsg}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Brand Hallmarks */}
            <div style={styles.hallmarksRow}>
              <div style={styles.hallmarkItem}>
                <span style={styles.hallmarkDot}>✦</span>
                <span>Handcrafted in Gujarat</span>
              </div>
              <div style={styles.hallmarkItem}>
                <span style={styles.hallmarkDot}>✦</span>
                <span>Authentic Artisan Craft</span>
              </div>
              <div style={styles.hallmarkItem}>
                <span style={styles.hallmarkDot}>✦</span>
                <span>Insured Express Delivery</span>
              </div>
            </div>

            {/* Handcrafted Description (Shown ONLY if provided) */}
            {product.description && product.description.trim() && (
              <div style={styles.editorialSection}>
                <h3 style={styles.editorialHeading}>THE CRAFT & SILHOUETTE</h3>
                <p style={styles.editorialBody}>{product.description}</p>
              </div>
            )}

            {/* Return Policy (Shown ONLY if provided) */}
            {product.returnDescription && product.returnDescription.trim() && (
              <div style={styles.editorialSection}>
                <h3 style={styles.editorialHeading}>RETURNS & EXCHANGES</h3>
                <p style={styles.editorialBody}>{product.returnDescription}</p>
              </div>
            )}

          </section>

        </div>
      </main>

      {/* ── Editorial Footer ── */}
      <footer style={styles.pageFooter}>
        <span style={styles.footerBrand}>MAMTA DESIGN CO.</span>
        <span style={styles.footerTagline}>CRAFTED IN GUJARAT · THE FESTIVE EDIT</span>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LUXURY DESIGN STYLES (MAMTA DESIGN CO.)
// ─────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#FBF8F2", // Ivory background matching site palette
    color: "#2D211D",
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 5vw",
    background: "rgba(251, 248, 242, 0.96)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid rgba(229, 212, 178, 0.7)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navBackBtn: {
    background: "none",
    border: "none",
    color: "#4B352A",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 0",
    transition: "color 0.2s ease",
  },
  navArrow: {
    fontSize: "14px",
    transition: "transform 0.2s ease",
  },
  brandLogo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textDecoration: "none",
    color: "#2D211D",
  },
  brandTitle: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: "24px",
    fontWeight: "600",
    letterSpacing: "0.14em",
    lineHeight: 1,
  },
  brandSub: {
    fontSize: "8px",
    fontWeight: "700",
    letterSpacing: "0.26em",
    color: "#B79A68",
    marginTop: "3px",
  },
  navBagBtn: {
    background: "#4B352A",
    color: "#FFFDF9",
    border: "none",
    borderRadius: "2px",
    padding: "8px 20px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.14em",
    cursor: "pointer",
    transition: "background 0.2s ease, transform 0.15s ease",
  },
  container: {
    flex: 1,
    maxWidth: "1320px",
    width: "100%",
    margin: "0 auto",
    padding: "48px 5vw 72px",
    boxSizing: "border-box",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "56px",
    alignItems: "start",
  },

  // ── Gallery Column ──
  galleryColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  mainImageFrame: {
    position: "relative",
    width: "100%",
    aspectRatio: "3 / 4",
    background: "#F5EFE5",
    borderRadius: "3px",
    overflow: "hidden",
    border: "1px solid rgba(229, 212, 178, 0.7)",
    boxShadow: "0 18px 45px rgba(75, 53, 42, 0.08)",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "opacity 0.25s ease",
  },
  noPhotoPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#74645D",
    fontSize: "14px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  offerBadge: {
    position: "absolute",
    top: "16px",
    left: "16px",
    background: "#5D2428",
    color: "#FFFDF9",
    padding: "7px 15px",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    borderRadius: "2px",
    boxShadow: "0 4px 14px rgba(93, 36, 40, 0.3)",
  },
  thumbnailStrip: {
    display: "flex",
    gap: "12px",
    overflowX: "auto",
    paddingBottom: "6px",
  },
  thumbnailBtn: {
    width: "78px",
    height: "102px",
    borderRadius: "3px",
    overflow: "hidden",
    padding: 0,
    background: "#F5EFE5",
    border: "2px solid #E5D4B2",
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.2s ease",
  },
  thumbnailImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  // ── Info Column ──
  infoColumn: {
    display: "flex",
    flexDirection: "column",
    paddingTop: "6px",
  },
  eyebrowRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  eyebrowTag: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.22em",
    color: "#B79A68",
    textTransform: "uppercase",
  },
  categoryDivider: {
    color: "#D0C2B2",
    fontSize: "12px",
  },
  categoryText: {
    fontSize: "11px",
    fontWeight: "500",
    letterSpacing: "0.12em",
    color: "#74645D",
    textTransform: "uppercase",
  },
  productTitle: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: "clamp(34px, 4.2vw, 54px)",
    fontWeight: "400",
    lineHeight: 1.05,
    color: "#2D211D",
    margin: "0 0 16px",
    letterSpacing: "0.01em",
  },

  // ── Pricing ──
  priceContainer: {
    marginBottom: "26px",
  },
  offerPriceBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  priceNumbers: {
    display: "flex",
    alignItems: "baseline",
    gap: "14px",
  },
  offerPriceValue: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: "36px",
    fontWeight: "600",
    color: "#5D2428",
    lineHeight: 1,
  },
  originalPriceStrikethrough: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: "22px",
    color: "#8C7C75",
    textDecoration: "line-through",
    lineHeight: 1,
  },
  offerInlineBadge: {
    display: "inline-block",
    width: "fit-content",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.14em",
    color: "#5D2428",
    background: "#F5E7E4",
    padding: "3px 10px",
    borderRadius: "2px",
    textTransform: "uppercase",
  },
  regularPriceValue: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: "36px",
    fontWeight: "500",
    color: "#2D211D",
    lineHeight: 1,
  },
  taxNotice: {
    display: "block",
    fontSize: "11px",
    color: "#8C7C75",
    marginTop: "8px",
    letterSpacing: "0.04em",
  },
  divider: {
    height: "1px",
    background: "rgba(229, 212, 178, 0.6)",
    margin: "0 0 26px",
  },

  // ── Quantity ──
  quantitySection: {
    marginBottom: "28px",
  },
  metaLabel: {
    display: "block",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.18em",
    color: "#74645D",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  quantityControl: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #D8C7AF",
    borderRadius: "2px",
    background: "#FFFDF9",
  },
  qtyAdjustBtn: {
    background: "none",
    border: "none",
    width: "44px",
    height: "44px",
    fontSize: "18px",
    color: "#2D211D",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s ease",
  },
  qtyDisplay: {
    minWidth: "48px",
    textAlign: "center",
    fontSize: "15px",
    fontWeight: "600",
    color: "#2D211D",
    borderLeft: "1px solid #EBE0D0",
    borderRight: "1px solid #EBE0D0",
    height: "44px",
    lineHeight: "44px",
  },

  // ── Add to Bag CTA ──
  ctaWrapper: {
    marginBottom: "32px",
  },
  addToBagBtn: {
    width: "100%",
    padding: "20px",
    background: "#4B352A",
    color: "#FFFDF9",
    border: "none",
    borderRadius: "2px",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(75, 53, 42, 0.18)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  },
  addedToast: {
    marginTop: "12px",
    padding: "10px 16px",
    background: "#F5EFE5",
    border: "1px solid #D8C7AF",
    borderRadius: "2px",
    color: "#4B352A",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.14em",
    textAlign: "center",
  },

  // ── Hallmarks ──
  hallmarksRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "18px",
    padding: "16px 0",
    borderTop: "1px solid rgba(229, 212, 178, 0.6)",
    borderBottom: "1px solid rgba(229, 212, 178, 0.6)",
    marginBottom: "32px",
  },
  hallmarkItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: "500",
    color: "#685850",
    letterSpacing: "0.04em",
  },
  hallmarkDot: {
    color: "#B79A68",
    fontSize: "9px",
  },

  // ── Editorial Details ──
  editorialSection: {
    marginBottom: "28px",
  },
  editorialHeading: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.22em",
    color: "#B79A68",
    textTransform: "uppercase",
    margin: "0 0 10px",
  },
  editorialBody: {
    fontSize: "14px",
    lineHeight: "1.75",
    color: "#4B352A",
    margin: 0,
    whiteSpace: "pre-line",
  },

  // ── Footer ──
  pageFooter: {
    marginTop: "auto",
    padding: "24px 5vw",
    borderTop: "1px solid rgba(229, 212, 178, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "10px",
    letterSpacing: "0.16em",
    color: "#8C7C75",
    flexWrap: "wrap",
    gap: "10px",
  },
  footerBrand: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: "14px",
    fontWeight: "600",
    color: "#4B352A",
    letterSpacing: "0.12em",
  },
  footerTagline: {
    textTransform: "uppercase",
  },

  // ── Loading & Error ──
  loadingWrapper: {
    minHeight: "75vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    padding: "40px",
    background: "#FBF8F2",
  },
  spinner: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "2px solid #E5D4B2",
    borderTopColor: "#5D2428",
    animation: "spin 0.9s linear infinite",
  },
  loadingText: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: "26px",
    fontStyle: "italic",
    color: "#4B352A",
    margin: 0,
  },
  loadingSub: {
    fontSize: "9px",
    letterSpacing: "0.25em",
    color: "#B79A68",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  errorTitle: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: "36px",
    color: "#5D2428",
    margin: "0 0 6px",
  },
  errorSub: {
    fontSize: "13px",
    color: "#74645D",
    margin: "0 0 24px",
  },
  backBtnLarge: {
    background: "#4B352A",
    color: "#FFFDF9",
    border: "none",
    padding: "14px 28px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.18em",
    borderRadius: "2px",
    cursor: "pointer",
  },
};

export default ProductDetail;
