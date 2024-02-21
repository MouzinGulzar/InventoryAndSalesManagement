const params = require("../utils/params");

const SupplierModel = require("../models/Supplier");
const InventoryModel = require("../models/Inventory");
const SalesModel = require("../models/Sales");

const helpers = require("../utils/helpers");

// ADD SUPPLIER PAGE
exports.getAddSupplier = async (req, res) => {
  res.render(
    "add-supplier",
    Object.assign(params("Suppliers - Add", "/suppliers/add-supplier"), {
      user: req.session.user,
    })
  );
};
// ADD SUPPLIER POST REQUEST
exports.postSuppliers = async (req, res) => {
  const { name, email, contact, address, tsr, note } = req.body;

  const supplier = new SupplierModel({
    name,
    email,
    contact,
    address,
    tsr,
    note,
  });

  try {
    await supplier.save({ userId: req.session.user._id });
    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Supplier added successfully!",
      })
    );
    res.redirect(`/suppliers?message=${message}`);
  } catch (err) {
    console.log(err);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );
    res.redirect(`/suppliers/add-supplier?message=${message}`);
  }
};

// SUPPLIERS PAGE
exports.getSuppliers = async (req, res) => {
  const query = req.query.q || "";
  const tsr = req.query.tsr || "";
  let page = parseInt(req.query.page) || 1;
  let limit = 100;

  let db_filter = {};

  if (query) {
    searchRegex = new RegExp(helpers.escapeRegex(query), "i");
    db_filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { contact: searchRegex },
      { address: searchRegex },
    ];
  }
  if (tsr) {
    db_filter.tsr = tsr;
  }

  const suppliers = await SupplierModel.find(db_filter)
    .sort({ name: 1 })
    .limit(limit)
    .skip(limit * (page - 1));

  const totalSuppliers = await SupplierModel.countDocuments(db_filter);

  res.render(
    "suppliers",
    Object.assign(params("Suppliers", "/suppliers"), {
      suppliers,
      query,
      tsr,
      page,
      totalSuppliers,
      user: req.session.user,
    })
  );
};
// GET SUPPLIER PAGE
exports.getSupplier = async (req, res) => {
  const { id } = req.params;

  const supplier = await SupplierModel.findById(id);

  if (!supplier) {
    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Supplier not found!",
      })
    );
    return res.redirect(`/suppliers?message=${message}`);
  }

  // products in inventory from this supplier
  const products = await InventoryModel.find({ supplier: id });
  const availProducts = products.filter((p) => p.quantity > 0 && p.status == "active");
  const outOfStockProducts = products.filter((p) => p.quantity == 0);

  // select sales that has products from this supplier
  const sales = await SalesModel.find({
    "products.product": { $in: products.map((p) => p._id) },
  }).populate({ path: "products.product", model: "inventory" });

  res.render(
    "supplier",
    Object.assign(params("Supplier", "/suppliers"), {
      supplier,
      products,
      availProducts,
      outOfStockProducts,
      sales,
      user: req.session.user,
    })
  );
};

// EDIT SUPPLIER PAGE
exports.getEditSupplier = async (req, res) => {
  const { id } = req.params;

  const supplier = await SupplierModel.findById(id);

  res.render(
    "edit-supplier",
    Object.assign(params("Suppliers - Edit", "/suppliers"), {
      supplier,
      user: req.session.user,
    })
  );
};
// EDIT SUPLLIER POST REQUEST
exports.postEditSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    await SupplierModel.updateOne(
      { _id: id },
      { $set: req.body },
      { userId: req.session.user._id }
    );

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Supplier edited successfully!",
      })
    );
    res.redirect(`/suppliers/${id}?message=${message}`);
  } catch (err) {
    console.error(err);
    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );
    res.redirect(`/suppliers/edit-supplier/${id}?message=${message}`);
  }
};

// DELETE SUPPLIER
exports.deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    await SupplierModel.deleteOne(
      { _id: id },
      { userId: req.session.user._id }
    );

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Supplier deleted successfully!",
      })
    );
    res.redirect(`/suppliers?message=${message}`);
  } catch (err) {
    console.log(err);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );
    res.redirect(`/suppliers?message=${message}`);
  }
};
