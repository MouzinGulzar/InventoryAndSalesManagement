const params = require("../utils/params");

const AdminModel = require("../models/Admin");

const { hashPassword } = require("../utils/auth");
const { unsubscribe } = require("../routes/users");

exports.getAddUser = async (req, res) => {
  res.render(
    "add-user",
    Object.assign(params("Users - Add", "/users/add-user"), {
      user: req.session.user,
    })
  );
};
exports.postAddUser = async (req, res) => {
  const { name, username, password, confirmPassword } = req.body;

  // redirect if the passwords do not match
  if (password !== confirmPassword) {
    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Passwords do not match!",
      })
    );
    return res.redirect(
      `/users/add-user?message=${message}&name=${encodeURIComponent(
        name
      )}&username=${encodeURIComponent(username)}`
    );
  }
  // redirect if the password is less than 6 characters
  if (password.length < 6) {
    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Password must be at least 6 characters long!",
      })
    );
    return res.redirect(
      `/users/add-user?message=${message}&name=${encodeURIComponent(
        name
      )}&username=${encodeURIComponent(username)}`
    );
  }

  // redirect if the username is less than 3 characters
  if (username.length < 3) {
    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Username must be at least 3 characters long!",
      })
    );
    return res.redirect(
      `/users/add-user?message=${message}&name=${encodeURIComponent(
        name
      )}&password=${encodeURIComponent(
        password
      )}&confirmPassword=${encodeURIComponent(confirmPassword)}`
    );
  }

  try {
    // check if the username already exists and redirect if it does
    const existingUser = await AdminModel.findOne({ username }).lean();
    if (existingUser) {
      const message = encodeURIComponent(
        JSON.stringify({
          type: "error",
          text: "Username already exists!",
        })
      );
      return res.redirect(
        `/users/add-user?message=${message}&name=${encodeURIComponent(
          name
        )}&password=${encodeURIComponent(
          password
        )}&confirmPassword=${encodeURIComponent(confirmPassword)}`
      );
    }

    const { hashedPassword, salt } = await hashPassword(password);

    const user = new AdminModel({
      name,
      username,
      password: hashedPassword,
      salt,
    });

    await user.save({ userId: req.session.user._id });

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "User added successfully!",
      })
    );

    res.redirect(`/users/add-user?message=${message}`);
  } catch (error) {
    console.error(error);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "An error occurred. Please try again!",
      })
    );
    res.redirect(
      `/users/add-user?message=${message}&name=${encodeURIComponent(
        name
      )}&username=${encodeURIComponent(username)}`
    );
  }
};

exports.getUsers = async (req, res) => {
  const query = req.query.q || "";

  const dbFilter = {};

  if (query) {
    dbFilter.$or = [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
    ];
  }

  const users = await AdminModel.find(dbFilter);

  res.render(
    "users",
    Object.assign(params("Users", "/users"), {
      users,
      query,
      user: req.session.user,
    })
  );
};

exports.getEditUser = async (req, res) => {
  const { id } = req.params;

  const usr = await AdminModel.findById(id);

  if (!usr) {
    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "User not found!",
      })
    );
    return res.redirect(`/users?message=${message}`);
  }

  res.render(
    "edit-user",
    Object.assign(params("Users - Edit", "/users/edit-user"), {
      usr,
      user: req.session.user,
    })
  );
};
exports.postEditUser = async (req, res) => {
  const { name, username, password, confirmPassword } = req.body;

  // redirect if the passwords do not match
  if (password !== confirmPassword) {
    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Passwords do not match!",
      })
    );
    return res.redirect(
      `/users/edit-user/${
        req.params.id
      }/?message=${message}&name=${encodeURIComponent(
        name
      )}&username=${encodeURIComponent(username)}`
    );
  }
  // redirect if the password is less than 6 characters
  if (password.length < 6) {
    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "Password must be at least 6 characters long!",
      })
    );
    return res.redirect(
      `/users/edit-user/${
        req.params.id
      }?message=${message}&name=${encodeURIComponent(
        name
      )}&username=${encodeURIComponent(username)}`
    );
  }

  try {
    const { hashedPassword, salt } = await hashPassword(password);

    await AdminModel.updateOne(
      { _id: req.params.id },
      {
        $set: { name, username, password: hashedPassword, salt },
      },
      { userId: req.session.user._id }
    );

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "User updated",
      })
    );

    res.redirect(`/users/edit-user/${req.params.id}?message=${message}`);
  } catch (error) {
    console.error(error);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "An error occurred. Please try again!",
      })
    );

    res.redirect(`/users/edit-user/${req.params.id}?message=${message}`);
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await AdminModel.deleteOne({ _id: id }, { userId: req.session.user._id });

    const message = encodeURIComponent(
      JSON.stringify({
        type: "success",
        text: "User deleted successfully!",
      })
    );

    res.redirect(`/users?message=${message}`);
  } catch (error) {
    console.error(error);

    const message = encodeURIComponent(
      JSON.stringify({
        type: "error",
        text: "An error occurred. Please try again!",
      })
    );
    res.redirect(`/users?message=${message}`);
  }
};
