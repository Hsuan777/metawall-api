const fs = require('fs');
const fse = require('fs-extra');
const { ImgurClient } = require('imgur');
const { handleSuccess, appError } = require('../service/handles');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const axios = require('axios');

const client = new ImgurClient({ accessToken: process.env.ACCESS_TOKEN });
const image = {
  async uploadToImgur(req, res, next) {
    await client.upload({
      image: fs.createReadStream(req.file.path),
      name: req.file.filename,
      type: 'stream',
      album: 'd1nJxAN'
    }).then((response) => {
      if (response.success) {
        const responseData = {
          link: response.data.link,
          name: response.data.name,
          hash: response.data.deletehash
        }
        handleSuccess(res, responseData);
      } else {
        appError(40001, next)
      }
    })
    fs.readdir('./uploads', (err, files) => {
      files.forEach(file => {
        fse.remove(`./uploads/${file}`)
      });
    });
  },
  async deleteImage(req, res, next) {
    const settings = {
      method: "delete",
      url: `https://api.imgur.com/3/image/${req.params.id}`,
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
      },
    };
    axios(settings).then((response) => {
      if (response.data.success) {
        handleSuccess(res, '刪除成功');
      } else {
        appError(40001, next)
      }
    }).catch(() => {
      appError(40001, next)
    })
  }
}

module.exports = image;