import { useEffect, useState } from "react";

function AdminProducts() {
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [collection, setCollection] = useState("Navratri");
  const [sizes, setSizes] = useState("S, M, L, XL");
  const [imageFile, setImageFile] = useState(null);

  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  // ===============================
  // LOAD PRODUCTS
  // ===============================

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Unable to load products:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ===============================
  // SELECT IMAGE
  // ===============================

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ===============================
  // ADD PRODUCT
  // ===============================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!name || !price || !collection || !imageFile) {
      setMessage("Please fill all fields and choose a product photo.");
      return;
    }

    try {
      setUploading(true);
      setMessage("Uploading product photo...");

      // ===============================
      // UPLOAD IMAGE TO CLOUDINARY
      // ===============================

      const formData = new FormData();

      formData.append("file", imageFile);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok) {
        throw new Error(
          cloudinaryData.error?.message || "Image upload failed."
        );
      }

      const imageUrl = cloudinaryData.secure_url;

      // ===============================
      // SAVE PRODUCT TO MONGODB
      // ===============================

      const productResponse = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category: "Chaniya Choli",
          collection,
          price: Number(price),
          sizes: sizes
            .split(",")
            .map((size) => size.trim())
            .filter(Boolean),
          image: imageUrl,
        }),
      });

      const productData = await productResponse.json();

      if (!productResponse.ok) {
        throw new Error(
          productData.message || "Unable to save product."
        );
      }

      setMessage("Product added successfully! ✅");

      // Clear form
      setName("");
      setPrice("");
      setCollection("Navratri");
      setSizes("S, M, L, XL");
      setImageFile(null);
      setImagePreview("");

      // Refresh product list
      loadProducts();
    } catch (error) {
      console.error("Product upload error:", error);
      setMessage(error.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "60px 7%",
        background: "#F9F3E5",
        color: "#4B352A",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "48px",
            marginBottom: "10px",
          }}
        >
          Admin Products
        </h1>

        <p
          style={{
            marginBottom: "40px",
            color: "#5F4A3D",
          }}
        >
          Add Chaniya Choli products to your MAMTA DESIGN CO. store.
        </p>

        {/* ===============================
            ADD PRODUCT FORM
        =============================== */}

        <div
          style={{
            background: "#FFFDF8",
            padding: "30px",
            borderRadius: "12px",
            border: "1px solid #E5D4B2",
            marginBottom: "50px",
          }}
        >
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "32px",
              marginBottom: "25px",
            }}
          >
            Add New Product
          </h2>

          <form onSubmit={handleSubmit}>
            {/* PRODUCT NAME */}

            <label>Product Name</label>

            <input
              type="text"
              placeholder="Example: Rani Mirrorwork Chaniya"
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={inputStyle}
            />

            {/* PRICE */}

            <label>Price</label>

            <input
              type="number"
              placeholder="12999"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              style={inputStyle}
            />

            {/* COLLECTION */}

            <label>Collection</label>

            <select
              value={collection}
              onChange={(event) => setCollection(event.target.value)}
              style={inputStyle}
            >
              <option value="Navratri">Navratri</option>
              <option value="Designer">Designer</option>
              <option value="Festive">Festive</option>
              <option value="Traditional">Traditional</option>
              <option value="Bandhani">Bandhani</option>
              <option value="Premium">Premium</option>
              <option value="Bridal">Bridal</option>
            </select>

            {/* SIZES */}

            <label>Sizes</label>

            <input
              type="text"
              placeholder="S, M, L, XL"
              value={sizes}
              onChange={(event) => setSizes(event.target.value)}
              style={inputStyle}
            />

            {/* IMAGE */}

            <label>Product Photo</label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              style={{
                ...inputStyle,
                padding: "12px",
              }}
            />

            {/* IMAGE PREVIEW */}

            {imagePreview && (
              <div style={{ marginBottom: "25px" }}>
                <p style={{ marginBottom: "10px" }}>Preview:</p>

                <img
                  src={imagePreview}
                  alt="Product preview"
                  style={{
                    width: "220px",
                    height: "280px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #E5D4B2",
                  }}
                />
              </div>
            )}

            {/* MESSAGE */}

            {message && (
              <p
                style={{
                  marginBottom: "20px",
                  fontWeight: "600",
                }}
              >
                {message}
              </p>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              disabled={uploading}
              style={{
                background: "#4B352A",
                color: "#FFFDF8",
                border: "none",
                padding: "15px 30px",
                borderRadius: "6px",
                cursor: uploading ? "not-allowed" : "pointer",
                fontWeight: "600",
                letterSpacing: "1px",
              }}
            >
              {uploading ? "UPLOADING..." : "ADD PRODUCT"}
            </button>
          </form>
        </div>

        {/* ===============================
            EXISTING PRODUCTS
        =============================== */}

        <h2
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "36px",
            marginBottom: "25px",
          }}
        >
          Products
        </h2>

        {products.length === 0 ? (
          <p>No products added yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "25px",
            }}
          >
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  background: "#FFFDF8",
                  border: "1px solid #E5D4B2",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "280px",
                    objectFit: "cover",
                  }}
                />

                <div style={{ padding: "18px" }}>
                  <h3
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "24px",
                      marginBottom: "8px",
                    }}
                  >
                    {product.name}
                  </h3>

                  <p>₹{product.price.toLocaleString("en-IN")}</p>

                  <p
                    style={{
                      fontSize: "14px",
                      opacity: 0.7,
                    }}
                  >
                    {product.collection}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===============================
// INPUT STYLE
// ===============================

const inputStyle = {
  width: "100%",
  padding: "13px 15px",
  marginTop: "8px",
  marginBottom: "20px",
  border: "1px solid #E5D4B2",
  borderRadius: "6px",
  background: "#FFFDF8",
  color: "#4B352A",
  fontSize: "15px",
  boxSizing: "border-box",
};

export default AdminProducts;