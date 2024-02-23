const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);

// dotenv config
require("dotenv").config();

// express app
const app = express();

// storing session in mongo db
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

// set up view engine and views folder
app.set("view engine", "pug");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, //1 week
  })
);

// Routes Here
const adminRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const inventoryRoutes = require("./routes/inventory");
const customerRoutes = require("./routes/customer");
const salesRoutes = require("./routes/sales");
const supplierRoutes = require("./routes/suppliers");
const categoryRoutes = require("./routes/categories");
const userRoutes = require("./routes/users");
const logsRoutes = require("./routes/logs");

const bookRoutes = require("./routes/book");

// Middleware Chain Here
app.use(adminRoutes);
app.use(dashboardRoutes);
app.use(inventoryRoutes);
app.use(customerRoutes);
app.use(salesRoutes);
app.use(supplierRoutes);
app.use(categoryRoutes);
app.use(userRoutes);
app.use(logsRoutes);

app.use(bookRoutes);

// Connection to database
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(mongoose.connection.readyState);
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}
connectToDatabase();

// Server
const server = app.listen(3000, () => {
  console.log(`Server listening on port ${server.address().port}`);
});

// Handle application shutdown
process.on("SIGINT", () => {
  console.log("Stopping server...");
  server.close(() => {
    console.log("Server stopped.");
    process.exit(0);
  });
});
