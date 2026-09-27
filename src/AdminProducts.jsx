import { useEffect, useState, useRef } from "react";

// ==========================================
// REUSABLE DRAG-AND-DROP PHOTO UPLOADER
// Luxury fashion aesthetic for MAMTA DESIGN CO.
// ==========================================
function ProductPhotoUploader({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  disabled = false,
  title = "DRAG & DROP PRODUCT PHOTOS",
  subtitle = "Drop up to 5 photos here or browse from your device",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [warning, setWarning] = useState("");
  const fileInputRef = useRef(null);

  const addFiles = (incomingFiles) => {
    const validImages = Array.from(incomingFiles).filter((file) =>
      file.type.startsWith("image/")
    );

    if (validImages.length === 0) return;

    if (photos.length + validImages.length > maxPhotos) {
      setWarning(`You can upload a maximum of ${maxPhotos} photos.`);
      const remainingSlots = Math.max(0, maxPhotos - photos.length);
      if (remainingSlots > 0) {
        const allowed = validImages.slice(0, remainingSlots);
        onPhotosChange([...photos, ...allowed]);
      }
    } else {
      setWarning("");
      onPhotosChange([...photos, ...validImages]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && photos.length < maxPhotos) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer?.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (index) => {
    setWarning("");
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const handleMoveToMain = (index) => {
    if (index === 0) return;
    const target = photos[index];
    const remaining = photos.filter((_, i) => i !== index);
    onPhotosChange([target, ...remaining]);
  };

  return (
    <div style={{ marginBottom: "25px" }}>
      {/* DRAG AND DROP ZONE */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && photos.length < maxPhotos) {
            fileInputRef.current?.click();
          }
        }}
        style={{
          border: isDragging ? "2px dashed #5D2428" : "2px dashed #D8C7AF",
          borderRadius: "10px",
          padding: "32px 20px",
          textAlign: "center",
          background: isDragging ? "#F5EFE5" : "#FFFDF8",
          cursor: disabled || photos.length >= maxPhotos ? "default" : "pointer",
          transition: "all 0.2s ease",
          boxShadow: isDragging ? "0 6px 20px rgba(93, 36, 40, 0.12)" : "none",
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp,image/jpg"
          multiple
          disabled={disabled || photos.length >= maxPhotos}
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files) {
              addFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />

        <div style={{ fontSize: "24px", color: "#B79A68", marginBottom: "6px" }}>
          ✦
        </div>

        <h4
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: "22px",
            margin: "0 0 6px",
            color: "#4B352A",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: "600",
          }}
        >
          {title}
        </h4>

        <p style={{ margin: "0 0 16px", color: "#74645D", fontSize: "14px" }}>
          {photos.length >= maxPhotos
            ? `All ${maxPhotos} photo slots are filled. Remove a photo to replace it.`
            : subtitle}
        </p>

        <button
          type="button"
          disabled={disabled || photos.length >= maxPhotos}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          style={{
            background: photos.length >= maxPhotos ? "#B5A79E" : "#4B352A",
            color: "#FFFDF9",
            border: "none",
            padding: "10px 24px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "600",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: disabled || photos.length >= maxPhotos ? "not-allowed" : "pointer",
            transition: "background 0.2s ease",
          }}
        >
          Browse Photos
        </button>

        <p style={{ margin: "14px 0 0", fontSize: "11px", color: "#A8978B", letterSpacing: "0.04em" }}>
          PNG, JPG, WEBP · Up to {maxPhotos} photos · First photo is set as Main Image
        </p>
      </div>

      {/* WARNING MESSAGE IF > 5 PHOTOS ATTEMPTED */}
      {warning && (
        <div
          style={{
            background: "#FCEEEB",
            color: "#8E2B2B",
            border: "1px solid #E6B5B0",
            padding: "10px 14px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "600",
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⚠</span>
          <span>{warning}</span>
        </div>
      )}

      {/* STATUS & COUNT HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "18px",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.1em",
            color: "#4B352A",
            textTransform: "uppercase",
          }}
        >
          {photos.length} / {maxPhotos} photos selected
        </span>

        {photos.length > 0 && photos.length < maxPhotos && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: "none",
              border: "none",
              color: "#5D2428",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            + Add More Photos
          </button>
        )}
      </div>

      {/* THUMBNAIL PREVIEWS */}
      {photos.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: "14px",
          }}
        >
          {photos.map((file, idx) => {
            const previewUrl = URL.createObjectURL(file);
            const isMain = idx === 0;

            return (
              <div
                key={idx}
                style={{
                  position: "relative",
                  border: isMain ? "2px solid #5D2428" : "1px solid #E5D4B2",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#F5EFE5",
                  aspectRatio: "3 / 4",
                  boxShadow: isMain
                    ? "0 4px 14px rgba(93, 36, 40, 0.22)"
                    : "0 2px 6px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <img
                  src={previewUrl}
                  alt={`Selected photo ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                {/* MAIN vs GALLERY BADGE */}
                <div
                  style={{
                    position: "absolute",
                    top: "6px",
                    left: "6px",
                    background: isMain ? "#5D2428" : "rgba(45, 33, 29, 0.85)",
                    color: isMain ? "#FFFDF9" : "#E5D4B2",
                    fontSize: "9px",
                    fontWeight: "700",
                    letterSpacing: "0.08em",
                    padding: "3px 7px",
                    borderRadius: "3px",
                    textTransform: "uppercase",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                  }}
                >
                  {isMain ? "★ MAIN PHOTO" : `GALLERY ${idx + 1}`}
                </div>

                {/* INDIVIDUAL REMOVE BUTTON */}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(idx);
                  }}
                  title="Remove this photo"
                  aria-label="Remove photo"
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "rgba(45, 33, 29, 0.85)",
                    color: "#FFFDF9",
                    border: "none",
                    cursor: disabled ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    lineHeight: 1,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                  }}
                >
                  ×
                </button>

                {/* MAKE MAIN BUTTON FOR GALLERY ITEMS */}
                {!isMain && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveToMain(idx);
                    }}
                    title="Set this photo as the Main Photo"
                    style={{
                      position: "absolute",
                      bottom: "6px",
                      left: "6px",
                      right: "6px",
                      background: "rgba(255, 253, 249, 0.95)",
                      color: "#4B352A",
                      border: "1px solid #D8C7AF",
                      borderRadius: "3px",
                      fontSize: "10px",
                      fontWeight: "700",
                      letterSpacing: "0.05em",
                      padding: "4px 0",
                      cursor: disabled ? "not-allowed" : "pointer",
                      textAlign: "center",
                    }}
                  >
                    SET AS MAIN
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN ADMIN PRODUCTS COMPONENT
// ==========================================
function AdminProducts() {
  const [products, setProducts] = useState([]);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerText, setOfferText] = useState("");
  const [description, setDescription] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [collection, setCollection] = useState("Navratri");

  // Selected Photos for Form (Drag-and-Drop)
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // Edit Mode
  const [editingProduct, setEditingProduct] = useState(null);

  // Change Photos Modal State
  const [changePhotosProduct, setChangePhotosProduct] = useState(null);
  const [modalPhotos, setModalPhotos] = useState([]);
  const [modalMessage, setModalMessage] = useState("");

  // Status
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const getAdminHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
  });

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
  // UPLOAD SINGLE IMAGE TO CLOUDINARY
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
  // UPLOAD MULTIPLE IMAGES (1–5)
  // Process all files up to 5, never only files[0]
  // ===============================
  const uploadMultipleImages = async (files, onProgress) => {
    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
      const url = await uploadImage(files[i]);
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  };

  // ===============================
  // RESET FORM
  // ===============================
  const resetForm = () => {
    setName("");
    setPrice("");
    setOfferPrice("");
    setOfferText("");
    setDescription("");
    setReturnDescription("");
    setCollection("Navratri");
    setSelectedPhotos([]);
    setEditingProduct(null);
  };

  // ===============================
  // ADD PRODUCT (WITH 1–5 PHOTOS)
  // ===============================
  const handleAddProduct = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!name || !price || !collection) {
      setMessage("Please fill in Product Name, Price, and Collection.");
      return;
    }

    if (selectedPhotos.length === 0) {
      setMessage("Please select or drop at least 1 product photo (up to 5).");
      return;
    }

    try {
      setUploading(true);

      const uploadedUrls = await uploadMultipleImages(
        selectedPhotos,
        (current, total) => {
          setMessage(`Uploading photo ${current} of ${total} to Cloudinary...`);
        }
      );

      setMessage("Saving product details...");

      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          name,
          category: "Chaniya Choli",
          collection,
          price: Number(price),
          offerPrice: offerPrice ? Number(offerPrice) : null,
          offerText: offerText || "",
          description: description || "",
          returnDescription: returnDescription || "",
          image: uploadedUrls[0] || "",
          images: uploadedUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add product.");
      }

      setMessage(
        `"${name}" added successfully with ${uploadedUrls.length} photo(s)! ✅`
      );

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
    setOfferPrice(product.offerPrice || "");
    setOfferText(product.offerText || "");
    setDescription(product.description || "");
    setReturnDescription(product.returnDescription || "");
    setCollection(product.collection);
    setSelectedPhotos([]);

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

      let imageUrl = editingProduct.image;
      let imagesUrls = editingProduct.images || [];

      // If new photos were dropped/selected, upload all of them
      if (selectedPhotos.length > 0) {
        const uploadedUrls = await uploadMultipleImages(
          selectedPhotos,
          (current, total) => {
            setMessage(`Uploading new photo ${current} of ${total}...`);
          }
        );
        imageUrl = uploadedUrls[0];
        imagesUrls = uploadedUrls;
      }

      setMessage("Updating product details...");

      const response = await fetch(
        `${API_URL}/api/products/${editingProduct._id}`,
        {
          method: "PUT",
          headers: getAdminHeaders(),
          body: JSON.stringify({
            name,
            category: "Chaniya Choli",
            collection,
            price: Number(price),
            offerPrice: offerPrice ? Number(offerPrice) : null,
            offerText: offerText || "",
            description: description || "",
            returnDescription: returnDescription || "",
            sizes: editingProduct.sizes || [],
            image: imageUrl,
            images: imagesUrls,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update product.");
      }

      setMessage(`"${name}" updated successfully! ✅`);

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
  // OPEN CHANGE PHOTOS MODAL
  // ===============================
  const openChangePhotosModal = (product) => {
    setChangePhotosProduct(product);
    setModalPhotos([]);
    setModalMessage("");
  };

  // ===============================
  // SAVE GALLERY PHOTOS FROM MODAL
  // ===============================
  const handleUploadModalPhotos = async () => {
    if (!changePhotosProduct || modalPhotos.length === 0) return;

    try {
      setUploading(true);
      setModalMessage(`Uploading 1 of ${modalPhotos.length} photos...`);

      const uploadedImages = await uploadMultipleImages(
        modalPhotos,
        (current, total) => {
          setModalMessage(
            `Uploading photo ${current} of ${total} to Cloudinary...`
          );
        }
      );

      setModalMessage("Saving product gallery...");

      const response = await fetch(
        `${API_URL}/api/products/${changePhotosProduct._id}/gallery`,
        {
          method: "PUT",
          headers: getAdminHeaders(),
          body: JSON.stringify({
            images: uploadedImages,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save product gallery.");
      }

      setMessage(
        `${changePhotosProduct.name}: ${uploadedImages.length} photos updated successfully! ✅`
      );

      await loadProducts();
      setModalPhotos([]);
      setModalMessage("");
      setChangePhotosProduct(null);
    } catch (error) {
      console.error("Gallery upload error:", error);
      setModalMessage(error.message || "Gallery upload failed.");
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

      const response = await fetch(`${API_URL}/api/products/${product._id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });

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

  const handleSubmit = editingProduct ? handleUpdateProduct : handleAddProduct;

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
            padding: "36px",
            borderRadius: "12px",
            border: "1px solid #E5D4B2",
            marginBottom: "50px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "32px",
              marginBottom: "25px",
            }}
          >
            {editingProduct ? `Edit: ${editingProduct.name}` : "Add New Product"}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* PRODUCT NAME */}
            <label style={labelStyle}>Product Name</label>
            <input
              type="text"
              placeholder="Example: Rani Mirrorwork Chaniya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />

            {/* PRICE */}
            <label style={labelStyle}>Price (₹)</label>
            <input
              type="number"
              placeholder="12999"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={inputStyle}
            />

            {/* COLLECTION */}
            <label style={labelStyle}>Collection</label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
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

            {/* OFFER PRICE */}
            <label style={labelStyle}>
              Offer Price (₹){" "}
              <span style={{ fontWeight: 400, fontSize: "13px", opacity: 0.6 }}>
                (leave empty if no offer)
              </span>
            </label>
            <input
              type="number"
              placeholder="e.g. 13999"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              style={inputStyle}
            />

            {/* OFFER TEXT / BADGE */}
            <label style={labelStyle}>
              Offer Text / Badge{" "}
              <span style={{ fontWeight: 400, fontSize: "13px", opacity: 0.6 }}>
                (e.g. "Festive Offer", "ONE OF ONE", "LIMITED EDITION")
              </span>
            </label>
            <input
              type="text"
              placeholder="Festive Offer – Limited Time"
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              style={inputStyle}
            />

            {/* DESCRIPTION */}
            <label style={labelStyle}>Product Description</label>
            <textarea
              placeholder="A handcrafted Gujarati Chaniya Choli featuring intricate mirrorwork..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
            />

            {/* RETURN DESCRIPTION */}
            <label style={labelStyle}>Return / Exchange Policy</label>
            <textarea
              placeholder="Returns accepted within 7 days. Item must be unused and in original packaging..."
              value={returnDescription}
              onChange={(e) => setReturnDescription(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
            />

            {/* CURRENT PHOTOS (IF IN EDIT MODE) */}
            {editingProduct && (editingProduct.images?.length > 0 || editingProduct.image) && (
              <div
                style={{
                  marginBottom: "25px",
                  padding: "18px",
                  background: "#F5EFE5",
                  borderRadius: "8px",
                }}
              >
                <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "700" }}>
                  Current Saved Photos:
                </p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {(editingProduct.images?.length > 0
                    ? editingProduct.images
                    : [editingProduct.image]
                  ).map((imgUrl, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img
                        src={imgUrl}
                        alt={`Current ${i + 1}`}
                        style={{
                          width: "70px",
                          height: "90px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          border: i === 0 ? "2px solid #5D2428" : "1px solid #E5D4B2",
                        }}
                      />
                      {i === 0 && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: "2px",
                            left: "2px",
                            right: "2px",
                            background: "#5D2428",
                            color: "#FFF",
                            fontSize: "8px",
                            fontWeight: "700",
                            textAlign: "center",
                            borderRadius: "2px",
                          }}
                        >
                          MAIN
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#74645D" }}>
                  {selectedPhotos.length > 0
                    ? "New photos selected below will replace these upon saving."
                    : "To replace these photos, drop or select new photos in the uploader below."}
                </p>
              </div>
            )}

            {/* DRAG AND DROP PRODUCT PHOTO UPLOADER */}
            <label style={labelStyle}>
              {editingProduct
                ? "Upload New Photos (Drop 1–5 photos to replace current photos)"
                : "Product Photos (Drag & Drop 1–5 photos · First photo = Main Image)"}
            </label>

            <ProductPhotoUploader
              photos={selectedPhotos}
              onPhotosChange={setSelectedPhotos}
              maxPhotos={5}
              disabled={uploading}
              title="DRAG & DROP PRODUCT PHOTOS"
              subtitle="Drop up to 5 photos here or browse from your computer"
            />

            {/* STATUS MESSAGE */}
            {message && (
              <p
                style={{
                  marginBottom: "20px",
                  fontWeight: "600",
                  color: message.includes("✅") ? "#2E6930" : "#5D2428",
                }}
              >
                {message}
              </p>
            )}

            {/* SUBMIT BUTTONS */}
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
                  ? "UPLOADING PHOTOS..."
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
            EXISTING PRODUCTS LIST
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
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "25px",
            }}
          >
            {products.map((product) => {
              const galleryCount =
                Array.isArray(product.images) && product.images.length > 0
                  ? product.images.length
                  : product.image
                  ? 1
                  : 0;

              return (
                <div
                  key={product._id}
                  style={{
                    background: "#FFFDF8",
                    border: "1px solid #E5D4B2",
                    borderRadius: "10px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* MAIN IMAGE */}
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

                  <div
                    style={{
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "24px",
                        marginBottom: "8px",
                      }}
                    >
                      {product.name}
                    </h3>

                    {/* PRICING */}
                    <p
                      style={{
                        fontSize: "18px",
                        marginBottom: "6px",
                      }}
                    >
                      {product.offerPrice && Number(product.offerPrice) > 0 ? (
                        <>
                          <span style={{ color: "#8E2B2B", fontWeight: "700" }}>
                            ₹{Number(product.offerPrice).toLocaleString("en-IN")}
                          </span>{" "}
                          <span
                            style={{
                              fontSize: "14px",
                              textDecoration: "line-through",
                              opacity: 0.6,
                            }}
                          >
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </span>
                        </>
                      ) : (
                        `₹${Number(product.price).toLocaleString("en-IN")}`
                      )}
                    </p>

                    {/* BADGE / OFFER TEXT */}
                    {product.offerPrice && product.offerText && (
                      <span
                        style={{
                          display: "inline-block",
                          width: "fit-content",
                          fontSize: "11px",
                          fontWeight: "700",
                          letterSpacing: "0.06em",
                          color: "#8E2B2B",
                          background: "#FCEEEB",
                          padding: "3px 8px",
                          borderRadius: "3px",
                          textTransform: "uppercase",
                          marginBottom: "8px",
                        }}
                      >
                        {product.offerText}
                      </span>
                    )}

                    <p
                      style={{
                        fontSize: "14px",
                        opacity: 0.7,
                        marginBottom: "15px",
                      }}
                    >
                      {product.collection} · {product.category || "Chaniya Choli"}
                    </p>

                    {/* GALLERY THUMBNAILS PREVIEW */}
                    {product.images && product.images.length > 0 && (
                      <div style={{ marginBottom: "14px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          {product.images.map((imgUrl, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={imgUrl}
                              alt={`Thumbnail ${imgIdx + 1}`}
                              title={imgIdx === 0 ? "Main Photo" : `Gallery Photo ${imgIdx + 1}`}
                              style={{
                                width: "36px",
                                height: "46px",
                                objectFit: "cover",
                                borderRadius: "4px",
                                border:
                                  imgIdx === 0
                                    ? "2px solid #5D2428"
                                    : "1px solid #E5D4B2",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CHANGE PHOTOS BUTTON (OPENS DRAG & DROP MODAL) */}
                    <div style={{ marginTop: "auto", marginBottom: "12px" }}>
                      <button
                        type="button"
                        onClick={() => openChangePhotosModal(product)}
                        disabled={uploading}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          background: "#4B352A",
                          color: "#FFFDF8",
                          border: "none",
                          borderRadius: "6px",
                          cursor: uploading ? "not-allowed" : "pointer",
                          textAlign: "center",
                          fontWeight: "600",
                          fontSize: "12px",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          transition: "background 0.2s ease",
                        }}
                      >
                        {galleryCount > 0
                          ? `CHANGE PHOTOS (${galleryCount}/5)`
                          : "UPLOAD 4–5 PHOTOS"}
                      </button>
                    </div>

                    {/* ACTION BUTTONS (EDIT / DELETE) */}
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
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
              );
            })}
          </div>
        )}

        {/* ===============================
            CHANGE PHOTOS MODAL (DRAG & DROP)
        =============================== */}
        {changePhotosProduct && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(45, 33, 29, 0.65)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
            onClick={() => {
              if (!uploading) setChangePhotosProduct(null);
            }}
          >
            <div
              style={{
                background: "#FFFDF8",
                borderRadius: "12px",
                border: "1px solid #E5D4B2",
                maxWidth: "680px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "32px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "0.14em",
                      color: "#B79A68",
                      textTransform: "uppercase",
                    }}
                  >
                    MAMTA DESIGN CO. · PRODUCT GALLERY
                  </p>
                  <h3
                    style={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontSize: "28px",
                      margin: 0,
                      color: "#4B352A",
                    }}
                  >
                    Update Photos: {changePhotosProduct.name}
                  </h3>
                </div>

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setChangePhotosProduct(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "26px",
                    cursor: uploading ? "not-allowed" : "pointer",
                    color: "#4B352A",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              {/* CURRENT GALLERY PREVIEW */}
              {changePhotosProduct.images &&
                changePhotosProduct.images.length > 0 &&
                modalPhotos.length === 0 && (
                  <div
                    style={{
                      marginBottom: "20px",
                      padding: "16px",
                      background: "#F5EFE5",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 10px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#5F4A3D",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      Currently Saved Photos ({changePhotosProduct.images.length}):
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      {changePhotosProduct.images.map((imgUrl, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          <img
                            src={imgUrl}
                            alt={`Current ${i + 1}`}
                            style={{
                              width: "60px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border:
                                i === 0
                                  ? "2px solid #5D2428"
                                  : "1px solid #E5D4B2",
                            }}
                          />
                          {i === 0 && (
                            <span
                              style={{
                                position: "absolute",
                                bottom: "2px",
                                left: "2px",
                                right: "2px",
                                background: "#5D2428",
                                color: "#FFF",
                                fontSize: "8px",
                                fontWeight: "700",
                                textAlign: "center",
                                borderRadius: "2px",
                              }}
                            >
                              MAIN
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p
                      style={{
                        margin: "10px 0 0",
                        fontSize: "11px",
                        color: "#74645D",
                      }}
                    >
                      Drop or select new photos below to replace the gallery with up to 5 photos.
                    </p>
                  </div>
                )}

              {/* THE REAL DRAG-AND-DROP UPLOADER */}
              <ProductPhotoUploader
                photos={modalPhotos}
                onPhotosChange={setModalPhotos}
                maxPhotos={5}
                disabled={uploading}
                title="DRAG & DROP NEW GALLERY PHOTOS"
                subtitle="Drop 1–5 photos here or browse from your computer"
              />

              {modalMessage && (
                <p
                  style={{
                    margin: "0 0 16px",
                    color: modalMessage.includes("✅") ? "#2E6930" : "#5D2428",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  {modalMessage}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "16px",
                }}
              >
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setChangePhotosProduct(null)}
                  style={{
                    background: "#E5D4B2",
                    color: "#4B352A",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "6px",
                    cursor: uploading ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  disabled={uploading || modalPhotos.length === 0}
                  onClick={handleUploadModalPhotos}
                  style={{
                    background:
                      uploading || modalPhotos.length === 0
                        ? "#9E8E85"
                        : "#4B352A",
                    color: "#FFFDF9",
                    border: "none",
                    padding: "12px 28px",
                    borderRadius: "6px",
                    cursor:
                      uploading || modalPhotos.length === 0
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {uploading
                    ? "UPLOADING PHOTOS..."
                    : `SAVE ${modalPhotos.length} PHOTO${
                        modalPhotos.length > 1 ? "S" : ""
                      }`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===============================
// LUXURY STYLES
// ===============================
const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#4B352A",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "13px 15px",
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
  textTransform: "uppercase",
  fontSize: "13px",
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
  textTransform: "uppercase",
  fontSize: "13px",
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