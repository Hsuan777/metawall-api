const { appError } = require('./handles');

function checkBody(name, data, next){
  const required = {
    user: ["name", "email"],
    post: ["user", "content"],
  };
  let count = 0;
  if (data instanceof Array &&  typeof data === 'object') {
    appError(400, '資料必須為物件', next);
  }
  required[name].forEach((item) => {
    if (data[item] === undefined) {
      appError(400, `「${item}」為必要欄位`, next);
    } else if (data[item] === "" || data[item].length === 0) {
      appError(400, `「${item}」不能為空值`, next);
    } else {
      count += 1;
    }
  });
  if (count === required[name].length) {
    return true
  }
};

module.exports = checkBody;