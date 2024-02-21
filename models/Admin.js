const mongoose = require("mongoose");
const {
  logUpdate,
  logDeletePre,
  logDeletePost,
  logCreate,
} = require("../utils/logMiddlewares");

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
});

// Logs
AdminSchema.pre("updateOne", logUpdate);
AdminSchema.pre("findOneAndUpdate", logUpdate);
AdminSchema.pre("deleteOne", { document: false, query: true }, logDeletePre);
AdminSchema.post("deleteOne", { document: false, query: true }, logDeletePost);
AdminSchema.post("save", logCreate);

const AdminModel = mongoose.model("admins", AdminSchema);

module.exports = AdminModel;
