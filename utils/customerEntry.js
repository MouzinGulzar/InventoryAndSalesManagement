const CustomerModel = require("../models/Customer");
const seedCustomers = async (customers) => {
  try {
    await CustomerModel.insertMany(customers);
    console.log("Customers successfully added to the database.");
  } catch (err) {
    console.error("Error adding customers:", err);
  }
};

const dummyCustomers = [
  {
    name: "John Doe",
    phone: "123-456-7890",
    email: "johndoe@example.com",
    address: "123 Main St, Anytown, AT 12345",
    loyaltyInfo: {
      loyaltyPoints: 5,
      memberSince: new Date(2020, 0, 1),
    },
    notes: "Frequent buyer",
  },
  {
    name: "Jane Smith",
    phone: "987-654-3210",
    email: "janesmith@example.com",
    address: "456 Elm St, Othertown, OT 98765",
    loyaltyInfo: {
      loyaltyPoints: 8,
      memberSince: new Date(2019, 5, 15),
    },
    notes: "Prefers email contact",
  },
  {
    name: "Alice Johnson",
    phone: "456-123-7890",
    email: "alicej@example.com",
    address: "789 Circle Drive, Somewhere, SW 45678",
    loyaltyInfo: {
      loyaltyPoints: 3,
      memberSince: new Date(2021, 3, 10),
    },
    notes: "Interested in new tech releases",
  },
  {
    name: "Carlos Rodriguez",
    phone: "321-987-6543",
    email: "carlosr@example.net",
    address: "321 Square Road, Anotherplace, AP 32132",
    loyaltyInfo: {
      loyaltyPoints: 7,
      memberSince: new Date(2018, 7, 22),
    },
    notes: "Regular customer for electronics",
  },
  {
    name: "Emily White",
    phone: "654-789-1230",
    email: "emilyw@example.org",
    address: "123 Line Street, Yettown, YT 65431",
    loyaltyInfo: {
      loyaltyPoints: 4,
      memberSince: new Date(2022, 1, 5),
    },
    notes: "Prefers eco-friendly products",
  },
  {
    name: "Daniel Green",
    phone: "789-654-3210",
    email: "danielg@example.co",
    address: "987 Triangle Ave, Thisplace, TP 78965",
    loyaltyInfo: {
      loyaltyPoints: 6,
      memberSince: new Date(2019, 10, 30),
    },
    notes: "Frequent purchases in bulk",
  },
  {
    name: "Fiona Brown",
    phone: "212-555-7890",
    email: "fionab@example.com",
    address: "654 Zigzag Blvd, Thatplace, TP 21212",
    loyaltyInfo: {
      loyaltyPoints: 2,
      memberSince: new Date(2020, 5, 15),
    },
    notes: "Interested in seasonal offers",
  },
];

module.exports = {seedCustomers, dummyCustomers};
