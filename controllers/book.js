const params = require("../utils/params");

const CategoryModel = require("../models/Categories");
const InventoryModel = require("../models/Inventory");
const BookingModel = require("../models/Booking");

const helpers = require("../utils/helpers");

// GET INVENTORY PAGE
exports.getInventory = async (req, res) => {
  let query = req.query.q || "";
  let category = req.query.category || "";
  let page = parseInt(req.query.page) || 1;
  let limit = 100;

  let db_filter = { quantity: { $gt: 0 }, status: "active" };

  if (query) {
    db_filter.product = new RegExp(helpers.escapeRegex(query), "i");
  }
  if (category) {
    db_filter.category = category;
  }

  const inventory = await InventoryModel.find(db_filter)
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: "category",
      model: "categories",
      select: "name",
    });

  const totalItems = await InventoryModel.countDocuments(db_filter);

  const categories = await CategoryModel.find();

  if (category) {
    category = categories.find((c) => c._id.toString() === category);
  }

  console.log(category);

  res.render(
    "book-inventory",
    Object.assign(params("Inventory - Device Dynasty", "/open-inventory"), {
      inventory,
      categories,
      query,
      category: category?.name,
      page,
      totalItems,
    })
  );
};

exports.getInventoryItem = async (req, res) => {
  const { id } = req.params;

  const item = await InventoryModel.findById(id).populate({
    path: "category",
    model: "categories",
    select: "name",
  });

  if (!item) {
    return res.redirect("/open-inventory");
  }

  res.render(
    "book-inventory-item",
    Object.assign(
      params(`Book ${item.product} - Device Dynasty`, "/open-inventory"),
      {
        item,
      }
    )
  );
};

// GET BOOKING PAGE
exports.getConfrimBooking = async (req, res) => {
  const { id } = req.params;

  const item = await InventoryModel.findById(id).populate({
    path: "category",
    model: "categories",
    select: "name",
  });

  if (!item) {
    return res.redirect("/open-inventory");
  }

  res.render(
    "confirm-booking",
    Object.assign(
      params(`Booking ${item.product} - Device Dynasty`, "/open-inventory"),
      {
        item,
      }
    )
  );
};
// POST BOOKING
exports.postBooking = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, quantity } = req.body;

  const item = await InventoryModel.findById(id).populate({
    path: "category",
    model: "categories",
    select: "name",
  });

  if (!item) {
    return res.redirect("/open-inventory");
  }

  const total = item.unitSellPrice * quantity;

  const booking = new BookingModel({
    user: { name, email, phone, address },
    item: { product: item._id, quantity, price: item.unitSellPrice },
    total,
  });

  await booking.save();

  res.redirect(`/open-inventory/after-booking/${booking._id}`);
};

// GET AFTER BOOKING PAGE
exports.getAfterBooking = async (req, res) => {
  const { id } = req.params;

  const booking = await BookingModel.findById(id).populate({
    path: "item.product",
    model: "inventory",
    select: "product",
  });

  if (!booking) {
    return res.redirect("/open-inventory");
  }

  res.render(
    "after-booking",
    Object.assign(
      params(
        `Booked ${booking.item.product.product} - Device Dynasty`,
        "/open-inventory"
      ),
      {
        booking,
      }
    )
  );
};

// GET BOOKINGS PAGE FOR ADMIN
exports.getBookings = async (req, res) => {
  const query = req.query.q || "";
  const status = req.query.status || "";
  const page = parseInt(req.query.page) || 1;
  const limit = 100;

  const db_filter = {};

  // add to db_filter if status is pending or onhold

  if (query) {
    db_filter.$or = [
      { "user.name": new RegExp(helpers.escapeRegex(query), "i") },
      { "user.email": new RegExp(helpers.escapeRegex(query), "i") },
      { "user.phone": new RegExp(helpers.escapeRegex(query), "i") },
      { "user.address": new RegExp(helpers.escapeRegex(query), "i") },
    ];
  }
  if (status) {
    db_filter.status = status;
  } else {
    db_filter.$or = [{ status: "pending" }, { status: "onhold" }];
  }

  console.log(db_filter);

  const bookings = await BookingModel.find(db_filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: "item.product",
      model: "inventory",
      select: "product",
    });

  const totalBookings = await BookingModel.countDocuments(db_filter);

  res.render(
    "bookings",
    Object.assign(params("Bookings - Device Dynasty", "/bookings"), {
      bookings,
      totalBookings,
      query,
      status,
      page,
      user: req.session.user,
    })
  );
};

exports.updateBookingStatus = async (req, res) => {
  const id = req.query.id;

  if (!id) {
    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Booking not found!",
      })
    );
    return res.redirect(`/bookings?message=${message}`);
  }

  const status = req.query.status;

  await BookingModel.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        status: status,
      },
    },
    {
      userId: req.session.user._id,
    }
  );

  const message = encodeURIComponent(
    JSON.stringify({
      type: "success",
      text: "Booking status updated!",
    })
  );
  res.redirect(`/bookings?message=${message}`);
};
