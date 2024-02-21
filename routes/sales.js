const express = require("express");
const router = express.Router();

const authenticate = require("../utils/middlewareAuth");

const salesController = require("../controllers/sales");

router.get("/sales/add-sale", authenticate, salesController.getAddSales);
router.post("/sales/add-sale", authenticate, salesController.postAddSale);

router.get("/sales", authenticate, salesController.getAllSales);
router.get(
  "/sales/after-sale/:saleId",
  authenticate,
  salesController.getAfterSale
);

router.get("/sales/delete-sale/:id", authenticate, salesController.deleteSale);

router.post(
  "/api/send-invoice-mail",
  authenticate,
  salesController.sendInvoiceMail
);

module.exports = router;
