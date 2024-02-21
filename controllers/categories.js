const params = require("../utils/params");

const CategoryModel = require("../models/Categories");
const SupplierModel = require("../models/Supplier");
const InventoryModel = require("../models/Inventory");

const helpers = require("../utils/helpers");

// GET ADD CATEGORY PAGE
exports.getAddCategory = async (req, res) => {
  res.render(
    "add-category",
    Object.assign(params("Categories - Add", "/categories/add-category"), {
      user: req.session.user,
    })
  );
};
// POST ADD CATEGORY
exports.postAddCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const category = new CategoryModel({ name, description });
    await category.save({ userId: req.session.user._id });

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Category added successfully!",
      })
    );
    res.redirect(`/categories?message=${message}`);
  } catch (error) {
    console.error(error);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );
    res.redirect(`/categories?message=${message}`);
  }
};

// GET CATEGORIES PAGE
exports.getCategories = async (req, res) => {
  const query = req.query.q || "";
  try {
    // Get the counts of items in each category for each status
    const counts = await InventoryModel.aggregate([
      {
        $group: {
          _id: {
            category: "$category",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert the counts array to a map for easier lookup
    const countMap = new Map();
    counts.forEach((item) => {
      const key = item._id.category.toString();
      if (!countMap.has(key)) {
        countMap.set(key, { active: 0, "out of stock": 0, discontinued: 0 });
      }
      countMap.get(key)[item._id.status] = item.count;
    });

    let db_filter = {};

    if (query) {
      searchRegex = new RegExp(helpers.escapeRegex(query), "i");
      db_filter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    // Fetch all categories
    const categories = await CategoryModel.find(db_filter);

    // sort categories by name
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

    // Create a new array with categories and their counts
    const categoriesWithCounts = categories.map((category) => {
      const categoryObject = category.toObject();
      const counts = countMap.get(category._id.toString()) || {
        active: 0,
        "out of stock": 0,
        discontinued: 0,
      };
      return {
        ...categoryObject,
        counts,
      };
    });

    console.log(categoriesWithCounts);

    res.render(
      "categories",
      Object.assign(params("Categories", "/categories"), {
        categories: categoriesWithCounts,
        query,
        user: req.session.user,
      })
    );
  } catch (error) {
    console.error(error);
    res.redirect("/categories");
  }
};

// GET EDIT CATEGORY PAGE
exports.getEditCategory = async (req, res) => {
  const id = req.params.id;

  const category = await CategoryModel.findById(id);

  res.render(
    "edit-category",
    Object.assign(params("Categories - Edit", "/categories/edit-category"), {
      category,
      user: req.session.user,
    })
  );
};
// POST EDIT REQUEST
exports.postEditCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    await CategoryModel.updateOne(
      { _id: id },
      {
        $set: {
          name,
          description,
        },
      },
      { userId: req.session.user._id }
    );

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Category edited successfully!",
      })
    );
    res.redirect(`/categories?message=${message}`);
  } catch (err) {
    console.error(err);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );
    res.redirect(`/categories/edit-category/${id}?message=${message}`);
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    await CategoryModel.deleteOne(
      { _id: id },
      { userId: req.session.user._id }
    );

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "Category deleted successfully!",
      })
    );
    res.redirect(`/categories?message=${message}`);
  } catch (err) {
    console.error(err);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Something went wrong! Try again later.",
      })
    );
    res.redirect(`/categories?message=${message}`);
  }
};
