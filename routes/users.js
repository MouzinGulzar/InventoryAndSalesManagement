const express = require("express");
const router = express.Router();

const authenticate = require("../utils/middlewareAuth");

const usersController = require("../controllers/users");

router.get("/users/add-user", authenticate, usersController.getAddUser);
router.post("/users/add-user", authenticate, usersController.postAddUser);

router.get("/users", authenticate, usersController.getUsers);

router.get("/users/edit-user/:id", authenticate, usersController.getEditUser);
router.post("/users/edit-user/:id", authenticate, usersController.postEditUser);

router.get("/users/delete-user/:id", authenticate, usersController.deleteUser);

module.exports = router;
