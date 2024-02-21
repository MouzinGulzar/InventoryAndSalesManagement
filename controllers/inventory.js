const params = require("../utils/params");

const CategoryModel = require("../models/Categories");
const SupplierModel = require("../models/Supplier");
const InventoryModel = require("../models/Inventory");

const helpers = require("../utils/helpers");

// GET INVENTORY PAGE
exports.getInventory = async (req, res) => {
  let query = req.query.q || "";
  let category = req.query.category || "";
  let supplier = req.query.supplier || "";
  let status = req.query.status || "";
  let page = parseInt(req.query.page) || 1;
  let limit = 100;

  let db_filter = { quantity: { $gt: 0 } };

  if (query) {
    db_filter.product = new RegExp(helpers.escapeRegex(query), "i");
  }
  if (category) {
    db_filter.category = category;
  }
  if (supplier) {
    db_filter.supplier = supplier;
  }
  if (status) {
    delete db_filter.quantity;
    db_filter.status = status;
  }

  const inventory = await await InventoryModel.find(db_filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: "category",
      model: "categories",
      select: "name",
    });

  const totalItems = await InventoryModel.countDocuments(db_filter);

  const categories = await CategoryModel.find();

  // sort categories
  categories.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    return 0;
  });

  if (category) {
    category = await CategoryModel.findById(category);
  }
  if (supplier) {
    supplier = await SupplierModel.findById(supplier);
  }

  res.render(
    "inventory",
    Object.assign(params("Inventory", "/inventory"), {
      inventory,
      categories,
      query,
      category: category?.name,
      supplier: supplier?.name,
      status,
      page,
      totalItems,
      user: req.session.user,
    })
  );
};
// GET INVENTORY ITEM PAGE
exports.getInventoryItem = async (req, res) => {
  const { id } = req.params;

  const inventoryItem = await InventoryModel.findById(id)
    .populate({
      path: "category",
      model: "categories",
    })
    .populate({ path: "supplier", model: "suppliers" });

  if (!inventoryItem) {
    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Item not found!",
      })
    );
    return res.redirect(`/inventory?message=${message}`);
  }

  res.render(
    "inventory-item",
    Object.assign(
      params(`Inventory - ${inventoryItem.product}`, "/inventory"),
      {
        inventoryItem,
        user: req.session.user,
      }
    )
  );
};

// ADD NEW PRODUCT PAGE
exports.getAddItem = async (req, res) => {
  let categories = await CategoryModel.find();

  // Sort Categories
  categories = categories.sort((a, b) => {
    // Compare two category names
    const nameA = a.name.toUpperCase(); // convert to uppercase for case-insensitive comparison
    const nameB = b.name.toUpperCase(); // convert to uppercase for case-insensitive comparison

    if (nameA < nameB) {
      return -1; // nameA comes first
    }
    if (nameA > nameB) {
      return 1; // nameB comes first
    }

    return 0; // names are equal
  });

  let suppliers = await SupplierModel.find();
  suppliers = suppliers.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    return 0;
  });

  res.render(
    "add-item",
    Object.assign(params("Inventory - Add Item", "/inventory/add-item"), {
      categories,
      suppliers,
      user: req.session.user,
    })
  );
};
// ADD NEW INVENTORY POST REQUEST
exports.postAddItem = async (req, res) => {
  const {
    product,
    unitCostPrice,
    unitSellPrice,
    quantity,
    category,
    supplier,
    description,
  } = req.body;

  try {
    const newInventoryItem = new InventoryModel({
      product,
      unitCostPrice,
      unitSellPrice,
      quantity,
      category,
      supplier,
      description,
    });

    await newInventoryItem.save({ userId: req.session.user._id });

    const supplierDetails = await SupplierModel.findById(supplier);
    const totalItemsBefore = supplierDetails.totalItems;
    const totalPurchasesBefore = supplierDetails.totalPurchases;
    // update total items and total purchases for supplier
    SupplierModel.updateOne(
      { _id: supplier },
      {
        $set: {
          totalItems: totalItemsBefore + Number(quantity),
          totalPurchases: totalPurchasesBefore + 1,
        },
      },
      { userId: req.session.user._id }
    );
    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Item added successfully!",
      })
    );
    res.redirect(`/inventory/add-item?message=${message}`);
  } catch (err) {
    console.error(err);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );

    res.redirect(`/inventory/add-item?message=${message}`);
  }
};

// EDIT INVENTORY PAGE
exports.getEditItem = async (req, res) => {
  const { id } = req.params;

  const inventoryItem = await InventoryModel.findById(id)
    .populate({
      path: "category",
      model: "categories",
    })
    .populate({ path: "supplier", model: "suppliers" });

  const categories = await CategoryModel.find();
  // sort categories
  categories.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    return 0;
  });

  const suppliers = await SupplierModel.find();
  // sort suppliers
  suppliers.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    return 0;
  });

  res.render(
    "edit-item",
    Object.assign(params("Edit Inventory", "/inventory"), {
      inventoryItem,
      categories,
      suppliers,
      user: req.session.user,
    })
  );
};
// EDIT INVENTORY POST REQUEST
exports.postEditItem = async (req, res) => {
  const { id } = req.params;
  const {
    productName,
    quantity,
    category,
    status,
    costPrice,
    sellPrice,
    supplier,
    description,
  } = req.body;

  try {
    await InventoryModel.updateOne(
      { _id: id },
      {
        $set: {
          product: productName,
          quantity,
          category,
          status,
          unitCostPrice: costPrice,
          unitSellPrice: sellPrice,
          supplier,
          description,
        },
      },
      { userId: req.session.user._id }
    );

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Item edited successfully!",
      })
    );
    res.redirect(`/inventory/${id}?message=${message}`);
  } catch (err) {
    console.error(err);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );
    res.redirect(`/inventory/edit-item/${id}?message=${message}`);
  }
};

// DELETE INVENTORY
exports.getDeleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    await InventoryModel.deleteOne(
      { _id: id },
      { userId: req.session.user._id }
    );
    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Item deleted successfully!",
      })
    );
    res.redirect(`/inventory?message=${message}`);
  } catch (err) {
    console.error(err);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );
    res.redirect(`/inventory?message=${message}`);
  }
};

// ASYNC INVENTORY SEARCH FUNCTION
exports.getInventorySearch = async (req, res) => {
  const searchTerm = req.query.term;

  const products = await InventoryModel.find({
    product: new RegExp(helpers.escapeRegex(searchTerm), "i"),
    status: "active",
  })
    .populate({ path: "category", model: "categories", select: "name" })
    .populate({ path: "supplier", model: "suppliers", select: "name" });

  res.json(products);
};
