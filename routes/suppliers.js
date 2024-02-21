const express = require("express");
const router = express.Router();

const authenticate = require("../utils/middlewareAuth");

const supplierController = require("../controllers/suppliers");

// ADD NEW SUPPLIER PAGE
router.get(
  "/suppliers/add-supplier",
  authenticate,
  supplierController.getAddSupplier
);
// ADD SUPPLIER POST REQUEST
router.post(
  "/suppliers/add-supplier",
  authenticate,
  supplierController.postSuppliers
);

// SUPPLIERS PAGE
router.get("/suppliers", authenticate, supplierController.getSuppliers);
// SUPPLIER PAGE
router.get("/suppliers/:id", authenticate, supplierController.getSupplier);

// EDIT SUPPLIER PAGE
router.get(
  "/suppliers/edit-supplier/:id",
  authenticate,
  supplierController.getEditSupplier
);
// EDIT SUPLLIER POST REQUEST
router.post(
  "/suppliers/edit-supplier/:id",
  authenticate,
  supplierController.postEditSupplier
);

// DELETE SUPPLIER
router.get(
  "/suppliers/delete-supplier/:id",
  authenticate,
  supplierController.deleteSupplier
);

module.exports = router;
