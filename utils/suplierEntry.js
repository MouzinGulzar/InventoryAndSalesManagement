const SupplierModel = require("../models/Supplier"); // Update with the correct path

const seedSuppliers = async (suppliers) => {
  try {
    await SupplierModel.insertMany(suppliers);
    console.log("Suppliers successfully added to the database.");
  } catch (err) {
    console.error("Error seeding suppliers:", err);
  }
};

const dummySuppliers = [
    {
      name: "Tech Supplies Inc.",
      contact: "123-456-7890",
      address: "123 Tech Street, Techville, TE 12345",
    },
    {
      name: "Gadget World",
      contact: "987-654-3210",
      address: "456 Gadget Road, Gadgetburg, GA 98765",
    },
    {
      name: "Electronic Essentials",
      contact: "555-678-1234",
      address: "789 Electronic Ave, Electronica, EL 54321",
    },
    {
      name: "Hardware Hub",
      contact: "321-456-7890",
      address: "321 Hardware Lane, Hardtown, HW 32132",
    },
    {
      name: "Accessory City",
      contact: "654-789-1234",
      address: "654 Accessory Blvd, Accessville, AC 65432",
    }
];     

module.exports = {seedSuppliers, dummySuppliers};
