// Middleware function to check if user is authenticated
const authenticate = (req, res, next) => {
  if (req.session.user) {
    // If user is authenticated and is an admin, proceed to the next middleware or route handler
    return next();
  } else {
    // If user is not authenticated or is not an admin, redirect to login page
    return res.redirect("/login");
  }
};

module.exports = authenticate;
