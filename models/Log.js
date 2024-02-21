const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  uid: mongoose.Schema.Types.ObjectId,
  opr: String,
  coll: String,
  documentId: mongoose.Schema.Types.ObjectId,
  changes: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

const Log = mongoose.model("logs", logSchema);

module.exports = Log;
