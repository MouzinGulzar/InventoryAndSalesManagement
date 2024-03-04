const mongoose = require("mongoose");
const {
  logUpdate,
  logDeletePre,
  logDeletePost,
  logCreate,
} = require("../utils/logMiddlewares");

const InventorySchema = new mongoose.Schema(
  {
    wsn: {
      type: String,
    },
    product: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "supplier",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    unitCostPrice: {
      type: Number,
      default: 0,
    },
    unitSellPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "discontinued", "out of stock"],
      default: "active",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Logs
InventorySchema.pre("updateOne", logUpdate);
InventorySchema.pre("findOneAndUpdate", logUpdate);
InventorySchema.pre(
  "deleteOne",
  { document: false, query: true },
  logDeletePre
);
InventorySchema.post(
  "deleteOne",
  { document: false, query: true },
  logDeletePost
);
InventorySchema.post("save", logCreate);

const InventoryModel = mongoose.model(
  "inventory",
  InventorySchema,
  "inventory"
);

module.exports = InventoryModel;
