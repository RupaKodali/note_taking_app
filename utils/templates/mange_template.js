const fillTemplateWithData = async(template, data) => {
  // Use a regular expression to find placeholders in the template
  const placeholderRegex = /\{\{(\w+)\}\}/g;

  // Replace each placeholder with its corresponding value from the data
  const updatedHTML = await template.replace(placeholderRegex, (match, key) => {
    return data[key] || match; // Use the value from data or the original placeholder if not found
  });

  return updatedHTML;
};

module.exports = fillTemplateWithData;