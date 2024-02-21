const params = (title, path, navbarHeading) => {
  return { title, path, navbarHeading: navbarHeading || title };
};

module.exports = params;
