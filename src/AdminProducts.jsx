import { useEffect, useState } from "react";

function AdminProducts() {
  const [products, setProducts] = useState([]);

  // Add / Edit form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [collection, setCollection] = useState("Navratri");
  const [sizes, setSizes] = useState("S, M, L, XL");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Edit mode
  const [editingProduct, setEditingProduct] = useState(null);

  // Status
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
      setMessage("Unable to load products.");
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
  // UPLOAD IMAGE TO CLOUDINARY
  // ===============================

  const uploadImage = async (file) => {
    const formData = new FormData();

    formData.append("file", file);
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

    return cloudinaryData.secure_url;
  };

  // ===============================
  // RESET FORM
  // ===============================

  const resetForm = () => {
    setName("");
    setPrice("");
    setCollection("Navratri");
    setSizes("S, M, L, XL");
    setImageFile(null);
    setImagePreview("");
    setEditingProduct(null);
  };

  // ===============================
  // ADD PRODUCT
  // ===============================

  const handleAddProduct = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!name || !price || !collection || !imageFile) {
      setMessage("Please fill all fields and choose a product photo.");
      return;
    }

    try {
      setUploading(true);
      setMessage("Uploading product photo...");

      const imageUrl = await uploadImage(imageFile);

      const response = await fetch(`${API_URL}/api/products`, {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add product.");
      }

      setMessage("Product added successfully! ✅");

      resetForm();
      await loadProducts();
    } catch (error) {
      console.error("Add product error:", error);
      setMessage(error.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  // ===============================
  // START EDITING
  // ===============================

  const startEditing = (product) => {
    setEditingProduct(product);

    setName(product.name);
    setPrice(product.price);
    setCollection(product.collection);
    setSizes(
      product.sizes && product.sizes.length > 0
        ? product.sizes.join(", ")
        : "S, M, L, XL"
    );

    setImageFile(null);
    setImagePreview(product.image || "");

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===============================
  // UPDATE PRODUCT
  // ===============================

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!editingProduct) return;

    if (!name || !price || !collection) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      setUploading(true);
      setMessage(
        imageFile ? "Uploading new product photo..." : "Updating product..."
      );

      let imageUrl = editingProduct.image;

      // Only upload a new image if user selected one
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const response = await fetch(
        `${API_URL}/api/products/${editingProduct._id}`,
        {
          method: "PUT",
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update product.");
      }

      setMessage("Product updated successfully! ✅");

      resetForm();
      await loadProducts();
    } catch (error) {
      console.error("Update product error:", error);
      setMessage(error.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  // ===============================
  // DELETE PRODUCT
  // ===============================

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setMessage("Deleting product...");

      const response = await fetch(
        `${API_URL}/api/products/${product._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete product.");
      }

      setMessage("Product deleted successfully! ✅");

      if (editingProduct?._id === product._id) {
        resetForm();
      }

      await loadProducts();
    } catch (error) {
      console.error("Delete product error:", error);
      setMessage(error.message || "Unable to delete product.");
    }
  };

  // ===============================
  // FORM SUBMIT
  // ===============================

  const handleSubmit = editingProduct
    ? handleUpdateProduct
    : handleAddProduct;

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
        {/* HEADER */}

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
          Manage Chaniya Choli products for MAMTA DESIGN CO.
        </p>

        {/* ===============================
            ADD / EDIT FORM
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
            {editingProduct ? "Edit Product" : "Add New Product"}
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

            <label>
              {editingProduct
                ? "Product Photo (choose only if you want to change it)"
                : "Product Photo"}
            </label>

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
                <p style={{ marginBottom: "10px" }}>
                  {editingProduct ? "Current / New Photo:" : "Preview:"}
                </p>

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

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={uploading}
                style={primaryButtonStyle}
              >
                {uploading
                  ? "PLEASE WAIT..."
                  : editingProduct
                  ? "SAVE CHANGES"
                  : "ADD PRODUCT"}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={uploading}
                  style={secondaryButtonStyle}
                >
                  CANCEL EDIT
                </button>
              )}
            </div>
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
          Products ({products.length})
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
                {/* IMAGE */}

                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "280px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "280px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#EDE3D4",
                      color: "#7A6659",
                      textAlign: "center",
                      padding: "20px",
                      boxSizing: "border-box",
                    }}
                  >
                    No product photo yet
                  </div>
                )}

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

                  <p
                    style={{
                      fontSize: "18px",
                      marginBottom: "6px",
                    }}
                  >
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>

<p
                    style={{
                      fontSize: "14px",
                      opacity: 0.7,
                      marginBottom: "15px",
                    }}
                  >
                    {product.collection}
                  </p>

                  {/* ACTION BUTTONS */}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => startEditing(product)}
                      style={editButtonStyle}
                    >
                      EDIT
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product)}
                      style={deleteButtonStyle}
                    >
                      DELETE
                    </button>
                  </div>
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
// STYLES
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

const primaryButtonStyle = {
  background: "#4B352A",
  color: "#FFFDF8",
  border: "none",
  padding: "15px 30px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  letterSpacing: "1px",
};

const secondaryButtonStyle = {
  background: "#E5D4B2",
  color: "#4B352A",
  border: "none",
  padding: "15px 30px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  letterSpacing: "1px",
};

const editButtonStyle = {
  flex: 1,
  minWidth: "80px",
  background: "#4B352A",
  color: "#FFFDF8",
  border: "none",
  padding: "10px 12px",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "600",
  letterSpacing: "0.5px",
};

const deleteButtonStyle = {
  flex: 1,
  minWidth: "80px",
  background: "#FFFDF8",
  color: "#4B352A",
  border: "1px solid #4B352A",
  padding: "10px 12px",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "600",
  letterSpacing: "0.5px",
};

export default AdminProducts;