const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const jwt = require("jsonwebtoken");

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Admin authentication required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token.",
    });
  }
};

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// CORS CONFIGURATION
// ===============================
const allowedOrigins = [
  "https://mamtadesignco.com",
  "https://www.mamtadesignco.com",
];

if (process.env.FRONTEND_URL) {
  try {
    const parsed = new URL(process.env.FRONTEND_URL).origin;
    if (!allowedOrigins.includes(parsed)) allowedOrigins.push(parsed);
  } catch (e) {}
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isLocal =
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin.startsWith("http://192.168.") ||
      origin.startsWith("http://10.") ||
      origin.startsWith("http://172.");

    if (isLocal || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// ===============================
// MONGODB CONNECTION
// ===============================

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully!");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .catch((error) => {
    console.error("MongoDB initial connection failed:");
    console.error(error.message);
  });

// Database availability middleware for API routes
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database service temporarily unavailable. Please try again shortly.",
      databaseConnected: false,
    });
  }
  next();
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: dbState === 1 ? "healthy" : "degraded",
    database: states[dbState] || "unknown",
    uptime: Math.round(process.uptime()),
  });
});

// ===============================
// ORDER SCHEMA
// ===============================

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: String,
      phone: String,
      email: String,
      address: String,
      area: String,
      city: String,
      state: String,
      pincode: String,
      payment: String,
    },

    items: [
      {
        id: mongoose.Schema.Types.Mixed,
        name: String,
        price: Number,
        quantity: Number,
        selectedSize: String,
        category: String,
      },
    ],

    total: Number,

    payment: String,

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    paymentStatus: {
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

// ===============================
// USER SCHEMA
// ===============================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

// ===============================
// PRODUCT SCHEMA
// ===============================

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Chaniya Choli",
    },

    collection: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    offerPrice: {
      type: Number,
      default: null,
    },

    offerText: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    returnDescription: {
      type: String,
      default: "",
    },

    sizes: {
      type: [String],
      default: [],
    },

    // Main/primary image — kept for backward compatibility
    image: {
      type: String,
      default: "",
    },

    // 4–5 product gallery images
    images: {
      type: [String],
      default: [],
    },

    // One-of-one inventory status
    isSold: {
      type: Boolean,
      default: false,
      index: true,
    },

    soldAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);


// ===============================
// ADMIN LOGIN
// ===============================

app.post("/api/admin/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password.",
      });
    }

    const emailMatch =
      email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

    const passwordMatch =
      password === process.env.ADMIN_PASSWORD;
    if (!emailMatch || !passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    const token = jwt.sign(
      {
        role: "admin",
        email: process.env.ADMIN_EMAIL,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.json({
      success: true,
      message: "Admin login successful!",
      token,
    });
  } catch (error) {
    console.error("Admin login error:");
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Unable to login as admin.",
    });
  }
});


// ===============================
// PRODUCT API
// ===============================

// GET ALL PRODUCTS
app.get("/api/products", checkDbConnection, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
    });
  }
});

// TOGGLE PRODUCT AVAILABILITY / SOLD STATUS (admin only)
app.patch("/api/products/:id/status", verifyAdminToken, checkDbConnection, async (req, res) => {
  try {
    const { id } = req.params;
    const { isSold } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        isSold: Boolean(isSold),
        soldAt: isSold ? new Date() : null,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.json({
      success: true,
      message: `Product marked as ${updated.isSold ? "sold" : "available"}.`,
      product: updated,
    });
  } catch (error) {
    console.error("Update product status error:", error.message);
    res.status(500).json({ success: false, message: "Unable to update product status." });
  }
});

// GET SINGLE PRODUCT BY ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:");
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch product.",
    });
  }
});

// CREATE PRODUCT (admin only)
app.post("/api/products", verifyAdminToken, async (req, res) => {
  console.log("CREATE PRODUCT REQUEST RECEIVED");

  try {
    const {
      name,
      category,
      collection,
      price,
      offerPrice,
      offerText,
      description,
      returnDescription,
      sizes,
      image,
      images,
    } = req.body;

    if (!name || !collection || !price || !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide product name, collection, price and image.",
      });
    }

    const newProduct = new Product({
      name,
      category: category || "Chaniya Choli",
      collection,
      price,
      offerPrice: offerPrice || null,
      offerText: offerText || "",
      description: description || "",
      returnDescription: returnDescription || "",
      sizes: sizes || [],
      image,
      images: images || [],
    });

    const savedProduct = await newProduct.save();

    console.log("=================================");
    console.log("NEW PRODUCT SAVED");
    console.log("=================================");
    console.log("Product ID:", savedProduct._id);
    console.log("Product:", savedProduct.name);

    res.status(201).json({
      success: true,
      message: "Product added successfully!",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Create product error:");
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create product.",
    });
  }
});

// UPDATE PRODUCT GALLERY (admin only)
app.put(
  "/api/products/:id/gallery",
  verifyAdminToken,
  async (req, res) => {
    try {
      const { images } = req.body;

      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: "Images must be an array.",
        });
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          images,
          image: images[0] || "",
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      res.json({
        success: true,
        message: "Product gallery updated successfully!",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Gallery update error:");
      console.error(error.message);

      res.status(500).json({
        success: false,
        message: "Unable to update product gallery.",
      });
    }
  }
);

// UPDATE PRODUCT (admin only)
app.put("/api/products/:id", verifyAdminToken, async (req, res) => {
  console.log("UPDATE PRODUCT REQUEST RECEIVED");

  try {
    const {
      name,
      category,
      collection,
      price,
      offerPrice,
      offerText,
      description,
      returnDescription,
      sizes,
      image,
      images,
    } = req.body;

    const updateData = {
      name,
      category: category || "Chaniya Choli",
      collection,
      price,
      offerPrice: offerPrice !== undefined ? (offerPrice || null) : undefined,
      offerText: offerText !== undefined ? offerText : undefined,
      description: description !== undefined ? description : undefined,
      returnDescription: returnDescription !== undefined ? returnDescription : undefined,
    };

    if (sizes !== undefined) {
      updateData.sizes = sizes;
    }

    if (Array.isArray(images)) {
      updateData.images = images;
      if (images.length > 0 && !image) {
        updateData.image = images[0];
      }
    }

    // Remove undefined keys so we don't accidentally unset fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Only update image if a real image URL was provided
    if (image) {
      updateData.image = image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:");
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update product.",
    });
  }
});

// DELETE PRODUCT (admin only)
app.delete("/api/products/:id", verifyAdminToken, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(
      req.params.id
    );

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    console.log("PRODUCT DELETED:", deletedProduct.name);

    res.json({
      success: true,
      message: "Product deleted successfully!",
    });
  } catch (error) {
    console.error("Delete product error:");
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Unable to delete product.",
    });
  }
});


// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MAMTA DESIGN CO. backend is running!",
  });
});

// ===============================
// CREATE USER
// ===============================

app.post("/api/users/register", async (req, res) => {
  console.log("USER REGISTRATION REQUEST RECEIVED");

  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    console.log("=================================");
    console.log("NEW USER REGISTERED");
    console.log("=================================");
    console.log("User ID:", savedUser._id);
    console.log("Name:", savedUser.name);
    console.log("Email:", savedUser.email);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
      },
    });
  } catch (error) {
    console.error("User registration error:");
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
});

// ===============================
// USER LOGIN
// ===============================

app.post("/api/users/login", async (req, res) => {
  console.log("USER LOGIN REQUEST RECEIVED");

  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email and password.",
      });
    }

    console.log("Looking for user:", normalizedEmail);

    const user = await User.findOne({
      email: normalizedEmail,
    });

    console.log("User found:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    console.log("=================================");
    console.log("USER LOGIN SUCCESSFUL");
    console.log("=================================");
    console.log("User:", user.name);
    console.log("Email:", user.email);

    res.json({
      success: true,
      message: "Login successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error("User login error:");
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
});


// ===============================
// HELPER: VALIDATE CART & CALCULATE SERVER TOTAL
// ===============================

async function validateCartAndCalculateTotal(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Your bag is empty." };
  }

  let calculatedTotal = 0;
  const validatedItems = [];
  const productIds = [];

  for (const item of items) {
    const rawId = item.id || item._id;
    if (!rawId || !mongoose.Types.ObjectId.isValid(rawId)) {
      return { error: `Invalid product identification for item.` };
    }

    const product = await Product.findById(rawId);
    if (!product) {
      return { error: `A product in your bag could not be found in our collection.` };
    }

    if (product.isSold) {
      return {
        error: `"${product.name}" has already been acquired by another client and is no longer available.`,
        soldProduct: product.name,
      };
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

    // Calculate effective price: prefer offerPrice if valid and lower than regular price
    const hasOffer =
      product.offerPrice !== null &&
      product.offerPrice !== undefined &&
      Number(product.offerPrice) > 0 &&
      Number(product.offerPrice) < Number(product.price);

    const unitPrice = hasOffer ? Number(product.offerPrice) : Number(product.price);
    calculatedTotal += unitPrice * qty;

    validatedItems.push({
      id: product._id,
      name: product.name,
      price: unitPrice,
      quantity: qty,
      selectedSize: item.selectedSize || "Free Size",
      category: product.category,
    });

    productIds.push(product._id);
  }

  if (calculatedTotal <= 0) {
    return { error: "Calculated order total must be greater than zero." };
  }

  return {
    total: calculatedTotal,
    items: validatedItems,
    productIds,
  };
}

// ===============================
// RAZORPAY CREATE ORDER (Server-Verified Price)
// ===============================

app.post("/api/payment/create-order", checkDbConnection, async (req, res) => {
  try {
    const { items, customer } = req.body;

    const validation = await validateCartAndCalculateTotal(items);
    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const { total, items: validatedItems } = validation;

    const options = {
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `mamta_${Date.now()}`,
      notes: {
        customer_email: customer?.email || "",
        items_count: String(validatedItems.length),
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
      verifiedTotal: total,
    });
  } catch (error) {
    console.error("Razorpay create order error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to initialize payment order. Please try again.",
    });
  }
});


// ===============================
// RAZORPAY VERIFY PAYMENT (Atomic Inventory Update & Idempotency)
// ===============================

app.post("/api/payment/verify", checkDbConnection, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      items,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment verification details.",
      });
    }

    // 1. Check for duplicate/replayed verification requests
    const existingOrder = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingOrder) {
      return res.json({
        success: true,
        message: "Order already verified and processed.",
        orderId: existingOrder._id,
      });
    }

    // 2. Cryptographic signature check
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);

    const signatureValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!signatureValid) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    // 3. Re-verify products and calculate verified total from MongoDB
    const validation = await validateCartAndCalculateTotal(items);
    const validatedItems = validation.items || items;
    const finalTotal = validation.total || req.body.total;
    const productIds = validation.productIds || items.map(i => i.id || i._id).filter(Boolean);

    // 4. Atomically mark products as sold
    if (productIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { isSold: true, soldAt: new Date() } }
      );
    }

    // 5. Save Order with verified data
    const newOrder = new Order({
      customer: {
        ...customer,
        payment: "online",
      },
      items: validatedItems,
      total: finalTotal,
      payment: "online",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: "paid",
    });

    const savedOrder = await newOrder.save();

    console.log("=================================");
    console.log("RAZORPAY PAYMENT VERIFIED & ORDER SAVED");
    console.log("Order ID:", savedOrder._id);
    console.log("Total:", finalTotal);
    console.log("=================================");

    res.json({
      success: true,
      message: "Payment verified and order saved successfully.",
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error("Razorpay verification error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to verify payment.",
    });
  }
});

// ===============================
// CREATE COD ORDER (Server-Verified Price & Inventory Lock)
// ===============================

app.post("/api/orders", checkDbConnection, async (req, res) => {
  console.log("ORDER REQUEST RECEIVED");

  try {
    const { customer, items } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required customer details.",
      });
    }

    // Verify products and calculate total from MongoDB
    const validation = await validateCartAndCalculateTotal(items);
    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const { total, items: validatedItems, productIds } = validation;

    // Atomically mark one-of-one products as sold
    if (productIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { isSold: true, soldAt: new Date() } }
      );
    }

    const newOrder = new Order({
      customer: {
        ...customer,
        payment: "cod",
      },
      items: validatedItems,
      total,
      payment: "cod",
      paymentStatus: "pending",
    });

    const savedOrder = await newOrder.save();

    console.log("=================================");
    console.log("NEW COD ORDER SAVED");
    console.log("Order ID:", savedOrder._id);
    console.log("Customer:", savedOrder.customer.name);
    console.log("Total:", savedOrder.total);
    console.log("=================================");

    res.status(201).json({
      success: true,
      message: "Order saved successfully!",
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error("Order save error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to save order. Please try again.",
    });
  }
});

// ===============================
// GET ALL ORDERS
// ===============================

app.get("/api/orders", verifyAdminToken, async (req, res) => {
  console.log("GET ORDERS REQUEST RECEIVED");

  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:");
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch orders.",
    });
  }
});

// ===============================
// GET ORDERS FOR ONE CUSTOMER
// ===============================

app.get("/api/orders/user/:email", checkDbConnection, async (req, res) => {
  try {
    const rawEmail = req.params.email;
    if (!rawEmail || typeof rawEmail !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid email parameter.",
      });
    }

    const email = rawEmail.trim().toLowerCase();

    const orders = await Order.find({
      "customer.email": email,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get customer orders error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch customer orders.",
    });
  }
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log("MAMTA DESIGN CO. BACKEND");
  console.log("=================================");
  console.log(`Server running on http://localhost:${PORT}`);
});