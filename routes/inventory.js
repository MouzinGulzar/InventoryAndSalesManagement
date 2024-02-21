const express = require("express");
const router = express.Router();

const authenticate = require("../utils/middlewareAuth");

const inventoryController = require("../controllers/inventory");

router.get("/inventory", authenticate, inventoryController.getInventory);

router.get("/inventory/add-item", authenticate, inventoryController.getAddItem);
router.post(
  "/inventory/add-item",
  authenticate,
  inventoryController.postAddItem
);

router.get(
  "/inventory/edit-item/:id",
  authenticate,
  inventoryController.getEditItem
);

router.post(
  "/inventory/edit-item/:id",
  authenticate,
  inventoryController.postEditItem
);

router.get(
  "/inventory/delete-item/:id",
  authenticate,
  inventoryController.getDeleteItem
);

router.post(
  "/inventory/add-item",
  authenticate,
  inventoryController.postAddItem
);

router.get(
  "/api/search-inventory",
  authenticate,
  inventoryController.getInventorySearch
);

router.get(
  "/inventory/:id",
  authenticate,
  inventoryController.getInventoryItem
);

module.exports = router;
