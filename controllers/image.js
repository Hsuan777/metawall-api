const fs = require('fs');
const { ImgurClient } = require('imgur');
const { handleSuccess, appError } = require('../service/handles');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const image = {
  async uploadToImgur(req, res, next) {
    const client = new ImgurClient({ accessToken: process.env.ACCESS_TOKEN });
    await client.upload({
      image: fs.createReadStream(req.file.path),
      name: req.file.filename,
      type: 'stream',
      album: 'd1nJxAN'
    }).then((response) => {
      const responseData = {
        link: response.data.link,
        name: response.data.name
      }
      handleSuccess(res, responseData)
    }).catch(() => appError(40001, next))
  }
}

module.exports = image;