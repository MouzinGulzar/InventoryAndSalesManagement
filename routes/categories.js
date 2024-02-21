const express = require("express");
const router = express.Router();

const authenticate = require("../utils/middlewareAuth");

const categoryController = require("../controllers/categories");

router.get(
  "/categories/add-category",
  authenticate,
  categoryController.getAddCategory
);
router.post(
  "/categories/add-category",
  authenticate,
  categoryController.postAddCategory
);

router.get("/categories", authenticate, categoryController.getCategories);

router.get(
  "/categories/edit-category/:id",
  authenticate,
  categoryController.getEditCategory
);
router.post(
  "/categories/edit-category/:id",
  authenticate,
  categoryController.postEditCategory
);

router.get(
  "/categories/delete-category/:id",
  authenticate,
  categoryController.deleteCategory
);

module.exports = router;
