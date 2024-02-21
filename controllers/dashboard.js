const params = require("../utils/params");

const InventoryModel = require("../models/Inventory");
const SalesModel = require("../models/Sales");
const SupplierModel = require("../models/Supplier");

exports.getDashboard = async (req, res, next) => {
  const salesFilter = req.query.salesFilter;

  const inventory = await InventoryModel.find();

  // fetch first 5 suppliers from supplierModel with totalItems in decending order
  const topSuppliers = await SupplierModel.find()
    .sort({ totalItems: -1 }) // Sort in descending order by totalItems
    .limit(5); // Limit the result to the first 5 suppliers

  let x, y;
  let totalSale;
  let layout = {
    fileopt: "overwrite",
    filename: "simple-node-example",
    xaxis: {
      title: "Date",
    },
    yaxis: {
      title: "Total Sales",
    },
  };

  if (salesFilter === "last30days") {
    const sales = await SalesModel.find({
      saleDate: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    });
    totalSale = sales
      .reduce((acc, sale) => acc + sale.totalSale, 0)
      .toLocaleString("en-IN", {
        maximumFractionDigits: 2,
        style: "currency",
        currency: "INR",
      });

    // Fill up the x-axis with the last 30 days excluding today in mmm dd format
    x = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(new Date().setDate(new Date().getDate() - i - 1));
      return `${date.toLocaleString("default", {
        month: "short",
      })} ${date.getDate()}`;
    }).reverse();

    // get the datesArray and map through it
    const datesArray = sales.map((sale) => sale.saleDate.toDateString());

    // get the actual full dates of last 30 days
    const fullDatesArray = Array.from({ length: 30 }, (_, i) => {
      return new Date(new Date().setDate(new Date().getDate() - i - 1));
    }).reverse();
    //  iterate throught datesArray and get the total sales for each date. for last 30 days which is not in datesArray, the total sales will be 0
    y = fullDatesArray.map((date) => {
      if (datesArray.includes(date.toDateString())) {
        // Sum the total sales for each date
        const salesThisDay = sales.filter(
          (sale) => sale.saleDate.toDateString() === date.toDateString()
        );

        return salesThisDay.reduce((acc, sale) => acc + sale.totalSale, 0);
      } else {
        return 0;
      }
    });
  } else {
    const sales = await SalesModel.find({
      saleDate: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    });

    totalSale = sales
      .reduce((acc, sale) => acc + sale.totalSale, 0)
      .toLocaleString("en-IN", {
        maximumFractionDigits: 2,
        style: "currency",
        currency: "INR",
      });

    // Fill up the x-axis with the last 30 days excluding today in mmm dd format
    x = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(new Date().setDate(new Date().getDate() - i - 1));
      return `${date.toLocaleString("default", {
        month: "short",
      })} ${date.getDate()}`;
    }).reverse();

    // get the datesArray and map through it
    const datesArray = sales.map(
      (sale) => sale.saleDate.toISOString().split("T")[0]
    );

    console.log("datesArray: ", datesArray);

    // get the actual full dates of last 30 days
    const fullDatesArray = Array.from({ length: 7 }, (_, i) => {
      return new Date(new Date().setDate(new Date().getDate() - i));
    }).reverse();
    console.log("fullDatesArray: ", fullDatesArray);
    //  iterate throught datesArray and get the total sales for each date. for last 30 days which is not in datesArray, the total sales will be 0
    y = fullDatesArray.map((date) => {
      if (datesArray.includes(date.toISOString().split("T")[0])) {
        // Sum the total sales for each date
        const salesThisDay = sales.filter((sale) => {
          console.log(
            sale.saleDate.toISOString().split("T")[0],
            date.toISOString().split("T")[0]
          );

          return (
            sale.saleDate.toISOString().split("T")[0] ===
            date.toISOString().split("T")[0]
          );
        });

        return salesThisDay.reduce((acc, sale) => acc + sale.totalSale, 0);
      } else {
        return 0;
      }
    });

    console.log("x", x);
    console.log("y", y);

    // layout.title = `Sales in Last 7 Days (${totalSalesInLast7Days})`;
  }

  const plotData = [
    {
      x,
      y,
      type: "bar",
    },
  ];

  res.render(
    "adminDashboard",
    Object.assign(params("Dashboard", "/"), {
      plotData: JSON.stringify(plotData),
      layout: JSON.stringify(layout),
      salesFilter,
      totalSale,
      inventory,
      topSuppliers,
      user: req.session.user,
    })
  );
};
