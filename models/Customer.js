const mongoose = require("mongoose");
const {
  logUpdate,
  logDeletePre,
  logDeletePost,
  logCreate,
} = require("../utils/logMiddlewares");

const CustomerSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
    },
    // Contact Information
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    // Address
    address: {
      type: String,
      required: true,
    },

    // Loyalty or Membership Information
    loyaltyInfo: {
      loyaltyPoints: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        default: 0,
      },
      memberSince: {
        type: Date,
        default: Date.now(),
      },
    },

    // Additional Note About Customer
    note: {
      type: String,
    },

    // Creation Date of Customer Record
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    // Update Date of Customer Record
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
CustomerSchema.pre("updateOne", logUpdate);
CustomerSchema.pre("findOneAndUpdate", logUpdate);
CustomerSchema.pre("deleteOne", { document: false, query: true }, logDeletePre);
CustomerSchema.post(
  "deleteOne",
  { document: false, query: true },
  logDeletePost
);
CustomerSchema.post("save", logCreate);

const CustomerModel = mongoose.model("customers", CustomerSchema);

module.exports = CustomerModel;
