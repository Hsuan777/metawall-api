const fs = require('fs');
// const fse = require('fs-extra');
const FormData = require('form-data');
const axios = require('axios');

const options = {
  method: 'post',
  url: 'https://api.imgur.com/3/image/',
  headers: {
    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
  },
  mimeType: 'multipart/form-data',
};

const Imgur = {
  upload(files) {
    const imagesData = [];
    files.forEach(async (item) => {
      const formData = new FormData();
      const encode_image = fs.readFileSync(item.path).toString('base64');
      formData.append('image', encode_image);
      formData.append('album', process.env.ACCESS_ALBUM);
      await axios({ ...options, data: form })
        .then((res) => {
          console.log(res);
          imagesData.push({
            deleteHash: res.data.data.deletehash,
            name: res.data.data.name,
            url: res.data.data.link,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    return imagesData;
  }
}

module.exports = Imgur;