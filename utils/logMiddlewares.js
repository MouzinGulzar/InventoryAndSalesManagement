const Log = require("../models/Log");

module.exports = {
  // Middleware for logging document updates
  logUpdate: async function (next) {
    // Store the original document before the update
    const originalDoc = await this.model.findOne(this.getQuery());
    const userId = this.options.userId; // Get the user ID from the options

    // Proceed with the update
    next();

    // After the update, find the updated document
    this.model.findOne(this.getQuery()).then((updatedDoc) => {
      if (updatedDoc) {
        // Calculate the changes by comparing the original and updated documents
        const changes = {};
        for (const key in updatedDoc.toObject()) {
          if (originalDoc[key] !== updatedDoc[key]) {
            changes[key] = updatedDoc[key];
          }
        }

        // Create a log entry with only the updated fields
        Log.create({
          uid: userId,
          opr: "update",
          coll: this.model.collection.name,
          documentId: updatedDoc._id,
          changes: changes,
        });
      }
    });
  },

  // Middleware for logging document deletions
  logDeletePre: async function (next) {
    const query = this.getQuery();
    const doc = await this.model.findOne(query);
    if (doc) {
      this._deletedDocument = doc.toObject(); // Clone the document before deletion
    }

    this._userId = this.options.userId; // Store the user ID from the options

    next();
  },
  logDeletePost: function () {
    if (this._deletedDocument) {
      Log.create({
        uid: this._userId,
        opr: "delete",
        coll: this.model.collection.name,
        documentId: this._deletedDocument._id,
        changes: this._deletedDocument, // Log the cloned document details
      });
    }
  },

  // Middleware for logging document creations
  logCreate: function (doc) {
    const userId = doc.$__.saveOptions.userId;
    Log.create({
      uid: userId,
      opr: "create",
      coll: doc.constructor.collection.name,
      documentId: doc._id,
      changes: doc.toObject(),
    });
  },
};
