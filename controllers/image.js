const fs = require('fs');
const { ImgurClient } = require('imgur');
const {handleSuccess, handleError} = require('../service/handles');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const image = {
  async uploadToImgur(req, res) {
    try {
      const client = new ImgurClient({ clientId: process.env.CLIENT_ID });
      const response = await client.upload({
        image: fs.createReadStream(req.file.path),
        type: 'stream',
      });
      handleSuccess(res, response.data.link)
    } catch {
      handleError(res, 400, 40001)
    }
  }
}

module.exports = image;