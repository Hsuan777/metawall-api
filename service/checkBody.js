const { handleError  } = require('./handles');

function checkBody(res, name, data){
  const required = {
    user: ["name", "email"],
    post: ["user", "content"],
  };
  let count = 0;
  try {
    if (data instanceof Array && typeof data === 'object') {
      throw '資料必須為物件'
    }
    required[name].forEach((item) => {
      if (data[item] === undefined) {
        throw `「${item}」為必要欄位`
      } else if (data[item] === "" || data[item].length === 0) {
        throw `「${item}」不能為空值`
      } else {
        count += 1;
      }
    });
    if (count === required[name].length) {
      return true
    }
  } catch(error) {
    handleError(res, 400, 40002, error);
  }
};

module.exports = checkBody;