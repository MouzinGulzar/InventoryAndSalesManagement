const mongoose = require("mongoose");
const { logUpdate, logDeletePre, logDeletePost, logCreate } = require("../utils/logMiddlewares");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Logs
CategorySchema.pre('updateOne', logUpdate);
CategorySchema.pre('findOneAndUpdate', logUpdate);
CategorySchema.pre("deleteOne", { document: false, query: true }, logDeletePre);
CategorySchema.post("deleteOne", { document: false, query: true }, logDeletePost);
CategorySchema.post('save', logCreate);

const CategoryModel = mongoose.model("categories", CategorySchema);

module.exports = CategoryModel;
