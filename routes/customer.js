const express = require("express");
const router = express.Router();

const authenticate = require("../utils/middlewareAuth");

const customerController = require("../controllers/customer");

router.get(
  "/customers/add-customer",
  authenticate,
  customerController.getAddCustomer
);
router.post(
  "/customers/add-customer",
  authenticate,
  customerController.postAddCustomer
);

router.get("/customers", authenticate, customerController.getAllCustomers);
router.get("/customers/:id", authenticate, customerController.getCustomer);

router.get(
  "/customers/edit-customer/:id",
  authenticate,
  customerController.getEditCustomer
);
router.post(
  "/customers/edit-customer/:id",
  authenticate,
  customerController.postEditCustomer
);

router.get(
  "/customers/delete-customer/:id",
  authenticate,
  customerController.deleteCustomer
);

router.get(
  "/api/search-customers",
  authenticate,
  customerController.getCustomerSearch
);

module.exports = router;
