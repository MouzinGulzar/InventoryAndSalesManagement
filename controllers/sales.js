const moment = require("moment-timezone");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const fs = require("fs");

const params = require("../utils/params");

const CustomerModel = require("../models/Customer");
const InventoryModel = require("../models/Inventory");
const SalesModel = require("../models/Sales");

const helpers = require("../utils/helpers");

// ADD NEW SALE PAGE
exports.getAddSales = async (req, res) => {
  try {
    const customers = await CustomerModel.find();
    const products = await InventoryModel.find();

    res.render(
      "add-sale",
      Object.assign(params("Sales - Add", "/sales/add-sales"), {
        customers,
        products,
        user: req.session.user,
      })
    );
  } catch (err) {
    console.log(err);
    res.redirect("/sales/add-sale");
  }
};
// ADD NEW SALE POST REQUEST
exports.postAddSale = async (req, res) => {
  try {
    const formData = req.body;

    // Extract product IDs, quantities, and selling prices from the form data
    let productDetails = {};
    for (const key in formData) {
      if (key.startsWith("product")) {
        const num = key.match(/\d+/)[0];
        const productId = formData[key];
        const quantity = parseInt(formData[`quantity${num}`], 10);
        const providedSellPrice = parseInt(formData[`price${num}`], 10);
        if (!productDetails[productId]) {
          productDetails[productId] = { quantity: 0, providedSellPrice: 0 };
        }
        productDetails[productId].quantity += quantity;
        productDetails[productId].providedSellPrice = providedSellPrice;
      }
    }

    // Fetch products from the database
    const productIds = Object.keys(productDetails);
    const inventoryItems = await InventoryModel.find({
      _id: { $in: productIds },
    });

    // Calculate profit and discount, and prepare products array for sale
    let totalProfit = 0,
      totalDiscount = 0,
      productsArray = [];

    for (const item of inventoryItems) {
      const detail = productDetails[item._id];
      if (item.quantity < detail.quantity) {
        return res
          .status(400)
          .send(`Not enough stock for product ID: ${item._id}`);
      }

      const actualUnitSellPrice = item.unitSellPrice;
      const unitCostPrice = item.unitCostPrice;
      const discountPerUnit = actualUnitSellPrice - detail.providedSellPrice;
      const profitPerUnit = detail.providedSellPrice - unitCostPrice;

      totalDiscount += discountPerUnit * detail.quantity;
      totalProfit += profitPerUnit * detail.quantity;

      productsArray.push({
        product: item._id,
        quantity: detail.quantity,
        unitSellPrice: detail.providedSellPrice,
      });

      // Update inventory quantity
      await InventoryModel.updateOne(
        { _id: item._id },
        {
          $set: {
            quantity: item.quantity - detail.quantity,
            status:
              item.quantity - detail.quantity === 0 ? "out of stock" : "active",
          },
        },
        { userId: req.session.user._id }
      );
    }

    if (formData.customer == "" || formData.customer == null) {
      const message = encodeURIComponent(
        JSON.stringify({
          type: "error",
          text: "Can't add sale without a customer! Try adding a customer to proceed.",
        })
      );
      return res.redirect(`/sales/add-sale?message=${message}`);
    }

    if (productsArray.length == 0) {
      const message = encodeURIComponent(
        JSON.stringify({
          type: "error",
          text: "No products added to sale! Try adding some to proceed.",
        })
      );
      return res.redirect(`/sales/add-sale?message=${message}`);
    }

    // Create the sale record
    const sale = {
      customer: formData.customer,
      products: productsArray,
      discount: totalDiscount,
      profit: totalProfit,
      paymentMethod: formData.paymentMethod,
    };

    const newSale = new SalesModel(sale);
    await newSale.save({ userId: req.session.user._id });

    console.log("New sale:", newSale);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Sale added successfully!",
      })
    );
    res.redirect(`/sales/after-sale/${newSale._id}?message=${message}`);
  } catch (error) {
    console.error("Error in processing the sale:", error);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );
    res.redirect(`/sales/add-sale?message=${message}`);
  }
};
// GET AFTER SALE PAGE
exports.getAfterSale = async (req, res) => {
  const sale = await SalesModel.findById(req.params.saleId)
    .populate({ path: "customer", model: "customers" })
    .populate({ path: "products.product", model: "inventory" });

  if (!sale) {
    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Sale not found! Try adding one.",
      })
    );
    return res.redirect(`/sales/add-sale?message=${message}`);
  }

  invoiceDate = moment(sale.saleDate)
    .tz("Asia/Kolkata")
    .format("ddd MMM DD YYYY hh:mm A");

  // get the invoice footer message from invoice-footer-text.txt file
  const invoiceFooterText = fs.readFileSync(
    "./public/data/invoice-footer-text.txt",
    "utf8"
  );

  res.render(
    "after-sale",
    Object.assign(params("Sales - After Sale", "/sales/after-sales"), {
      sale,
      invoiceDate,
      invoiceFooterText,
      user: req.session.user,
    })
  );
};

// GET SALES PAGE
exports.getAllSales = async (req, res) => {
  const query = req.query.q || "";
  const paymethod = req.query.paymethod || "";
  const status = req.query.status || "";
  const from = req.query.from || "";
  const to = req.query.to || "";
  const customer = req.query.customer || "";
  let page = parseInt(req.query.page) || 1;
  let limit = 100;

  let db_filter = {};

  const searchRegex = new RegExp(helpers.escapeRegex(query), "i");

  // BUILD THE FILTER
  // If query is present, search for the query in the customer details and product details
  if (query) {
    db_filter.$or = [
      { "customerDetails.name": searchRegex },
      { "customerDetails.email": searchRegex },
      { "customerDetails.phone": searchRegex },
      { "customerDetails.address": searchRegex },
      { "productDetails.product": searchRegex },
      { totalSale: searchRegex },
    ];

    // Check if the query is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(query)) {
      db_filter.$or.push({ _id: new mongoose.Types.ObjectId(query) });
    }
  }

  // If paymethod is present, filter by paymentMethod
  if (paymethod) {
    db_filter.paymentMethod = paymethod;
  }
  // If status is present, filter by status
  if (status) {
    db_filter.status = status;
  }
  // If from and to are present, filter by saleDate and find sales between the dates
  if (from && to) {
    db_filter.saleDate = {
      $gte: new Date(from),
      $lt: new Date(to),
    };
  }
  // If from is present and to is not, filter by saleDate and find sales from the from date to the current date
  if (from && !to) {
    db_filter.saleDate = {
      $gte: new Date(from),
    };
  }
  // If from is not present and to is present, filter by saleDate and find sales from the beginning to the to date
  if (!from && to) {
    db_filter.saleDate = {
      $lt: new Date(to),
    };
  }

  // If customer is present, filter by customer
  if (customer) {
    // set the customer filter to match the customer id in customerDetails
    db_filter["customerDetails._id"] = new mongoose.Types.ObjectId(customer);
  }

  const pipeline = [
    {
      $lookup: {
        from: "customers",
        localField: "customer",
        foreignField: "_id",
        as: "customerDetails",
      },
    },
    {
      $lookup: {
        from: "inventory",
        localField: "products.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: "$customerDetails",
    },
    {
      $match: db_filter,
    },
  ];

  try {
    const sales = await SalesModel.aggregate(pipeline)
      .sort({ saleDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get the total count of sales matching the pipeline
    const totalCountResult = await SalesModel.aggregate([
      ...pipeline, // Use the same pipeline to match the same set of documents
      { $count: "totalCount" },
    ]);

    // Extract the total count from the result
    const totalSales =
      totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    res.render(
      "sales",
      Object.assign(params("Sales - All", "/sales"), {
        sales,
        query,
        paymethod,
        status,
        from,
        to,
        customer,
        page,
        totalSales,
        user: req.session.user,
      })
    );
  } catch (err) {
    console.log(err);
    res.redirect("/sales");
  }
};

// DELETE SALE
exports.deleteSale = async (req, res) => {
  try {
    const sale = await SalesModel.findById(req.params.id);

    // Update inventory quantity
    for (const item of sale.products) {
      const product = await InventoryModel.findById(item.product);
      if (!product) {
        continue;
      } // skip if product not found

      newQuantity = product.quantity + item.quantity;
      await InventoryModel.updateOne(
        { _id: item.product },
        {
          $set: {
            quantity: newQuantity,
            status: "active",
          },
        }
      );
    }

    await SalesModel.deleteOne(
      { _id: req.params.id },
      { userId: req.session.user._id }
    );

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Sale deleted successfully!",
      })
    );
    res.redirect(`/sales?message=${message}`);
  } catch (err) {
    console.log(err);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );
    res.redirect(`/sales?message=${message}`);
  }
};

// EMAIL INVOICE
exports.sendInvoiceMail = async (req, res) => {
  const { to, subject, html } = req.body;

  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: process.env.INVOICE_EMAIL, // Your email
      pass: process.env.INVOICE_EMAIL_PASS, // Your email password or app-specific password
    },
  });

  try {
    // Send email
    await transporter.sendMail({
      from: `"Device Dynasty" ${process.env.INVOICE_EMAIL}`,
      to,
      subject,
      html,
    });

    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send email");
  }
};
