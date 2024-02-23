const express = require("express");
const router = express.Router();

const authenticate = require("../utils/middlewareAuth");
const bookControllers = require("../controllers/book");

router.get("/open-inventory", bookControllers.getInventory);
router.get("/open-inventory/:id", bookControllers.getInventoryItem);

router.get("/open-inventory/book-item/:id", bookControllers.getConfrimBooking);
router.post("/open-inventory/book-item/:id", bookControllers.postBooking);

router.get(
  "/open-inventory/after-booking/:id",
  bookControllers.getAfterBooking
);

router.get("/bookings", authenticate, bookControllers.getBookings);
router.get("/bookings/update", authenticate, bookControllers.updateBookingStatus);

module.exports = router;
