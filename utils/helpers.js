// Function to escape special characters for regular expressions
exports.escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}; 
