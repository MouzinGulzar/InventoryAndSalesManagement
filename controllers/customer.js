const params = require("../utils/params");

const CustomerModel = require("../models/Customer");
const SalesModel = require("../models/Sales");

const helpers = require("../utils/helpers");

// ADD NEW CUSTOMER PAGE
exports.getAddCustomer = async (req, res) => {
  // await seedCustomers(dummyCustomers);
  res.render(
    "add-customer",
    Object.assign(params("Add - Customer", "/customers/add-customer"), {
      user: req.session.user,
    })
  );
};
// ADD NEW CUSTOMER POST REQUEST
exports.postAddCustomer = async (req, res) => {
  const { name, phone, email, address, loyaltyPoints, note } = req.body;

  try {
    const newCustomer = new CustomerModel({
      name,
      phone,
      email,
      address,
      loyaltyInfo: {
        loyaltyPoints,
      },
      note,
    });

    await newCustomer.save({ userId: req.session.user._id });

    console.log("New Customer Added Successfully");

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Customer added successfully!",
      })
    );

    res.redirect(`/customers/add-customer?message=${message}`);
  } catch (err) {
    console.log(err);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );

    res.redirect(`/customers/add-customer?message=${message}`);
  }
};

// GET ALL CUSTOMERS
exports.getAllCustomers = async (req, res) => {
  const query = req.query.q || "";
  const lp = req.query.lp || "";
  let page = parseInt(req.query.page) || 1;
  let limit = 100;

  let db_filter = {};

  if (query && lp) {
    searchRegex = new RegExp(helpers.escapeRegex(query), "i");
    db_filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { address: searchRegex },
    ];
    db_filter["loyaltyInfo.loyaltyPoints"] = lp;
  } else if (query) {
    searchRegex = new RegExp(helpers.escapeRegex(query), "i");
    db_filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { address: searchRegex },
    ];
  } else if (lp) {
    db_filter["loyaltyInfo.loyaltyPoints"] = lp;
  }

  try {
    const customers = await CustomerModel.find(db_filter)
      .sort({ name: 1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalCustomers = await CustomerModel.countDocuments(db_filter);

    res.render(
      "customers",
      Object.assign(params("Customers", "/customers"), {
        customers,
        query,
        lp,
        page,
        totalCustomers,
        user: req.session.user,
      })
    );
  } catch (err) {
    console.log(err);
    res.redirect("/customers");
  }
};
// GET CUSTOMER PAGE
exports.getCustomer = async (req, res) => {
  const customerId = req.params.id;
  const customer = await CustomerModel.findById(customerId);

  if (!customer) {
    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Customer not found!",
      })
    );
    return res.redirect(`/customers?message=${message}`);
  }

  const sales = await SalesModel.find({ customer: customerId });

  const totalSalesNo = sales.length;
  const totalProductsNo = sales.reduce(
    (acc, sale) => acc + sale.products.length,
    0
  );
  const totalSales = sales.reduce((acc, sale) => acc + sale.totalSale, 0);

  res.render(
    "customer",
    Object.assign(params(`Customer - ${customer.name}`, "/customers"), {
      customer,
      totalSalesNo,
      totalProductsNo,
      totalSales,
      user: req.session.user,
    })
  );
};

// EDIT CUSTOMER PAGE
exports.getEditCustomer = async (req, res) => {
  const { id } = req.params;

  const customer = await CustomerModel.findById(id);

  res.render(
    "edit-customer",
    Object.assign(params("Customers - Edit", "/customers/eidt-customer"), {
      customer,
      user: req.session.user,
    })
  );
};
// EDIT SUPLLIER POST REQUEST
exports.postEditCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address, loyaltyPoints, note } = req.body;

  try {
    await CustomerModel.updateOne(
      { _id: id },
      {
        $set: {
          name,
          phone,
          email,
          address,
          "loyaltyInfo.loyaltyPoints": loyaltyPoints,
          note,
        },
      },
      { userId: req.session.user._id }
    );

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Changes saved successfully!",
      })
    );

    res.redirect(`/customers/${id}?message=${message}`);
  } catch (err) {
    console.error(err);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );
    res.redirect(`/customers/edit-customer/${id}?message=${message}`);
  }
};

// DELETE CUSTOMER
exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    await CustomerModel.deleteOne(
      { _id: id },
      { userId: req.session.user._id }
    );

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Customer deleted successfully!",
      })
    );

    res.redirect(`/customers?message=${message}`);
  } catch (err) {
    console.error(err);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );
    res.redirect(`/customers?message=${message}`);
  }
};

// ASYNC CUSTOMER SEARCH FUNCTION
exports.getCustomerSearch = async (req, res) => {
  const searchTerm = req.query.term;
  // Search logic (e.g., using MongoDB $regex for partial matching)
  const customers = await CustomerModel.find({
    name: new RegExp(helpers.escapeRegex(searchTerm), "i"),
  });
  res.json(customers);
};
