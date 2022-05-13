// const fs = require('fs');
// const fse = require('fs-extra');
// const FormData = require('form-data');
// const { ImgurClient } = require('imgur');
const { handleSuccess, appError } = require('../service/handles');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const axios = require('axios');

const Imgur = require('../utils/imgur');
const image = {
  async upload(req, res, next) {
    const result = await Imgur.upload(req.files);
    handleSuccess(res, result)
  },
  async delete(req, res, next) {
    const result = await Imgur.delete(req.body);
    handleSuccess(res, result)
  }
}

module.exports = image;