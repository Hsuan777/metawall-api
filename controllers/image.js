const fs = require('fs');
const fse = require('fs-extra');
const FormData = require('form-data');
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
      name:  req.file.filename,
      type: 'stream',
      album: process.env.ACCESS_ALBUM
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
  async upload(req, res, next) {
    const responseData = [];
    async function uploadToImgur(){
      for (const item of req.files) {
        const encode_image = await fs.readFileSync(item.path).toString('base64');
        const formData = new FormData();
        await formData.append('image', encode_image);
        formData.append('album', process.env.ACCESS_ALBUM);
        const config = {
          method: 'post',
          url: 'https://api.imgur.com/3/image',
          headers: { 
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
            ...formData.getHeaders()
          },
          mimeType: 'multipart/form-data',
        };
        config.data = formData;
        await axios(config).then((res) => {
          console.log(res.data);
        }).catch((err) => {
          console.log(err.response.data);
        })
        fs.readdir('./uploads', (err, files) => {
          files.forEach(file => {
            fse.remove(`./uploads/${file}`)
          });
        });
      }
    };
    await uploadToImgur();
    handleSuccess(res, responseData);
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