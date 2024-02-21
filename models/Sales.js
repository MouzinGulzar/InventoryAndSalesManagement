const mongoose = require("mongoose");
const {
  logUpdate,
  logDeletePre,
  logDeletePost,
  logCreate,
} = require("../utils/logMiddlewares");

const SalesSchema = new mongoose.Schema({
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },

  // Array of products sold
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unitSellPrice: {
        type: Number,
        required: true,
      },
    },
  ],

  // Total sale made
  totalSale: {
    type: Number,
    default: function () {
      return this.products.reduce((acc, curr) => {
        return acc + curr.quantity * curr.unitSellPrice;
      }, 0);
    },
  },

  // Discount given
  discount: {
    type: Number,
    default: 0,
  },

  // Profit made
  profit: {
    type: Number,
    required: true,
  },

  // Date of the sale
  saleDate: {
    type: Date,
    default: Date.now(),
  },

  // Payment Method
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "online", "cheque"],
    required: true,
  },

  // Sale Status (e.g., completed, pending, cancelled)
  status: {
    type: String,
    enum: ["completed", "pending", "cancelled"],
    default: "completed",
  },
});

// Logs
SalesSchema.pre("updateOne", logUpdate);
SalesSchema.pre("findOneAndUpdate", logUpdate);
SalesSchema.pre("deleteOne", { document: false, query: true }, logDeletePre);
SalesSchema.post("deleteOne", { document: false, query: true }, logDeletePost);
SalesSchema.post("save", logCreate);

const SalesModel = mongoose.model("sales", SalesSchema);

module.exports = SalesModel;
