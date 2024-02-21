const mongoose = require("mongoose");
const {
  logUpdate,
  logDeletePre,
  logDeletePost,
  logCreate,
} = require("../utils/logMiddlewares");

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  tsr: {
    type: String,
    required: true,
  },
  totalPurchases: {
    type: Number,
    default: 0,
  },
  totalItems: {
    type: Number,
    default: 0,
  },
  note: {
    type: String,
  },
});

// Logs
SupplierSchema.pre("updateOne", logUpdate);
SupplierSchema.pre("findOneAndUpdate", logUpdate);
SupplierSchema.pre("deleteOne", { document: false, query: true }, logDeletePre);
SupplierSchema.post(
  "deleteOne",
  { document: false, query: true },
  logDeletePost
);
SupplierSchema.post("save", logCreate);

const SupplierModel = mongoose.model("suppliers", SupplierSchema);

module.exports = SupplierModel;
