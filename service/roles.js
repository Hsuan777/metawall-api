const validator = require('validator');
const { appError } = require('./handles');
const User = require('../model/userModel');

const requiredBody = {
  user: ["name", "email", "password"],
  post: ["content"],
};
const keywords = {
  politician: ['蔡英文', '朱立倫', '蘇貞昌', '陳時中', '柯文哲', '侯友宜'],
  marks: ['.', '=', '?', '[', ']', ,'(', ')', '/', '|', '!', '！', '@', '＠', '#', '＃', '$', '%', '^', '&', '*', '+', '-', '~', '~', ';', ',', '<', '>', '。', '，', '?', ':', '{', '}', ' '],
}

const roles = {
  checkBody(name, data, next){
    let result = false;
    // body 是否為物件
    if (data instanceof Array &&  typeof data === 'object') {
      appError(40004, next);
      return result
    }
    // body 是否缺少欄位名稱或空值
    requiredBody[name].forEach((item) => {
      if (data[item] === undefined) {
        appError(40003, next, `「${item}」為必要欄位`);
        result = false;
      } else if (data[item] === "" || data[item].length === 0) {
        appError(40003, next, `「${item}」不能為空值`);
        result = false;
      } else {
        result = true;
      }
    });
    return result
  },
  checkName(name, next) {
    let result = false;
    // 暱稱 是否低於或高於指定字串長度
    if (name.length <= 2 || name.length > 20) {
      appError(40003, next, '暱稱需為 2 ~ 20 字元');
      return result;
    };
    // 暱稱 是否包含部分關鍵字
    for (const keyword in Object.keys(keywords)) {
      const isInclude = keywords[Object.keys(keywords)[keyword]].some((item) => name.includes(item) === true);
      if (!isInclude) {
        result = true;
      } else {
        appError(40003, next, '暱稱不能包含部分符號與人物');
        return false;
      }
    }
    return result;
  },
  checkPassword(password, confirmPassword, next) {
    let result = false;
    // 密碼 是否低於 8 碼
    if (!validator.isLength(password, {min:8})) {
      appError(40003, next, '密碼不能低於 8 碼');
      return result;
    };
    if (!validator.isLength(password, {max:20})) {
      appError(40003, next, '密碼不能高於 20 碼');
      return result;
    };
    // 密碼 是否包含中文
    const chineseRegExp = new RegExp("[\u4E00\-\u9FA5]+")
    if(chineseRegExp.test(password)) {
      appError(40003, next, '密碼不能包含中文');
      return result;
    }
    // 密碼 是否英數混合
    const englishRegExp = new RegExp("[a-zA-Z]")
    if(!englishRegExp.test(password)) {
      appError(40003, next, '密碼需為英數混合');
      return result;
    }
    // 密碼 是否英數混合
    const numberRegExp = new RegExp("[0-9]")
    if(!numberRegExp.test(password)) {
      appError(40003, next, '密碼需為英數混合');
      return result;
    }
    // 密碼 是否ㄧ致
    if (password !== confirmPassword) {
      appError(40003, next, '密碼不一致');
      return result;
    };
    return true;
  },
  checkEmail(email, existed, next) {
    let result = false;
    // email 是否格式正確
    if (!validator.isEmail(email)) {
      appError(40003, next, '信箱格式錯誤');
      return result;
    };
    // email 是否已存在
    if (existed) {
      appError(40003, next, '信箱已註冊');
      return result;
    };
    return true;
  }
}

module.exports = roles;