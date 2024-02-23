const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    user: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    item: {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
    status: {
      type: String,
      enum: ["pending", "canceled", "onhold", "rejected", "completed"],
      required: true,
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const BookingModel = mongoose.model("bookings", BookingSchema);

module.exports = BookingModel;
