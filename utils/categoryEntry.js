const CategoryModel = require("../models/Categories");

const seedCategories = async (categories) => {
  try {
    for (const category of categories) {
      const newCategory = new CategoryModel(category);
      await newCategory.save();
    }
    console.log("Categories successfully added to the database.");
  } catch (err) {
    console.error("Error seeding categories:", err);
  }
};

const categories = [
  {
    name: "mobile",
    description:
      "Latest models and variants of smartphones from leading brands.",
  },
  {
    name: "mobile covers",
    description:
      "A range of protective and stylish covers for different mobile models.",
  },
  {
    name: "earphones and headphones",
    description:
      "High-quality audio devices for an immersive listening experience.",
  },
  {
    name: "chargers and cables",
    description:
      "Durable and fast charging solutions with a variety of cable options.",
  },
  {
    name: "earpods",
    description:
      "Wireless and compact earpods providing excellent sound quality and comfort.",
  },
  {
    name: "refurbished",
    description:
      "Pre-owned products that are refurbished and certified for quality and performance.",
  },
  {
    name: "tempered glasses",
    description:
      "High-strength tempered glasses to protect screens from scratches and breaks.",
  },
  {
    name: "screen guards",
    description:
      "Screen protection solutions to extend the life of mobile and tablet screens.",
  },
  {
    name: "powerbanks",
    description:
      "Portable charging solutions to keep your devices powered on-the-go.",
  },
  {
    name: "smart watches",
    description:
      "Wearable technology that combines fitness tracking with smart notifications.",
  },
  {
    name: "speakers",
    description:
      "A range of speakers offering superior sound quality for all your audio needs.",
  },
  {
    name: "memory cards and usb drives",
    description:
      "Reliable storage solutions to expand your device's memory capacity.",
  },
  {
    name: "gaming accessories",
    description:
      "Enhance your gaming experience with top-of-the-line gaming gear and accessories.",
  },
  {
    name: "camera accessories",
    description:
      "Everything from lenses to tripods to enhance your photography and videography.",
  },
  {
    name: "bulbs and lights",
    description:
      "A variety of lighting solutions for home, office, or outdoor use.",
  },
  {
    name: "laptop accessories",
    description:
      "Essential accessories for your laptop including bags, mice, and cooling pads.",
  },
  {
    name: "mobile accessories",
    description:
      "A wide range of accessories to complement and enhance your mobile experience.",
  },
  {
    name: "wearables",
    description:
      "Trendy and functional wearable devices for health monitoring and smart connectivity.",
  },
  {
    name: "printer and ink",
    description:
      "High-quality printers and ink supplies for personal and professional use.",
  },
  {
    name: "home appliances",
    description:
      "Modern and efficient appliances to upgrade your home living experience.",
  },
  {
    name: "memory devices",
    description:
      "Various devices for your digital storage needs, from SSDs to external hard drives.",
  },
];

module.exports = {
  seedCategories,
  categories,
};
