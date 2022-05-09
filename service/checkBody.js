const { appError } = require('./handles');

function checkBody(name, data, next){
  const required = {
    user: ["name", "email", "password"],
    post: ["user", "content"],
  };
  let count = 0;
  if (data instanceof Array &&  typeof data === 'object') {
    appError(40004, next);
  }
  required[name].forEach((item) => {
    if (data[item] === undefined) {
      appError(40003, next, `「${item}」為必要欄位`);
    } else if (data[item] === "" || data[item].length === 0) {
      appError(40003, next, `「${item}」不能為空值`);
    } else {
      count += 1;
    }
  });
  if (count === required[name].length) {
    return true
  }
};

module.exports = checkBody;