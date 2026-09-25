const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
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
        id: Number,
        name: String,
        price: Number,
        quantity: Number,
        selectedSize: String,
        category: String,
      },
    ],

    total: Number,

    payment: String,
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

    sizes: {
      type: [String],
      default: [],
    },

    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);


// ===============================
// PRODUCT API
// ===============================

// GET ALL PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:");
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
    });
  }
});

// CREATE PRODUCT
app.post("/api/products", async (req, res) => {
  console.log("CREATE PRODUCT REQUEST RECEIVED");

  try {
    const {
      name,
      category,
      collection,
      price,
      sizes,
      image,
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
      sizes: sizes || [],
      image,
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
});// ===============================
// PRODUCT API
// ===============================

// GET ALL PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:");
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
    });
  }
});

// CREATE PRODUCT
app.post("/api/products", async (req, res) => {
  console.log("CREATE PRODUCT REQUEST RECEIVED");

  try {
    const {
      name,
      category,
      collection,
      price,
      sizes,
      image,
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
      sizes: sizes || [],
      image,
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
// CREATE ORDER
// ===============================

app.post("/api/orders", async (req, res) => {
  console.log("ORDER REQUEST RECEIVED");

  try {
    const { customer, items, total, payment } = req.body;

    const newOrder = new Order({
      customer,
      items,
      total,
      payment,
    });

    const savedOrder = await newOrder.save();

    console.log("=================================");
    console.log("NEW ORDER SAVED");
    console.log("=================================");
    console.log("Order ID:", savedOrder._id);
    console.log("Customer:", savedOrder.customer.name);
    console.log("Total:", savedOrder.total);

    res.status(201).json({
      success: true,
      message: "Order saved successfully!",
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error("Order save error:");
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Unable to save order.",
    });
  }
});

// ===============================
// GET ALL ORDERS
// ===============================

app.get("/api/orders", async (req, res) => {
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

app.get("/api/orders/user/:email", async (req, res) => {
  console.log("GET CUSTOMER ORDERS REQUEST RECEIVED");

  try {
    const email = req.params.email.toLowerCase();

    const orders = await Order.find({
      "customer.email": email,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get customer orders error:");
    console.error(error.message);

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
})