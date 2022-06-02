const FormData = require('form-data');
const axios = require('axios');
const sharp = require('sharp');
const { appError } = require('../service/handles');


const Imgur = {
  async upload(files, next, imgWidth, imgHeight) {
    const imagesData = [];
    for (const file in files) {
      const formData = new FormData();
      const options = {
        method: 'post',
        url: 'https://api.imgur.com/3/image/',
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          ...formData.getHeaders()
        },
        mimeType: 'multipart/form-data',
      };
      const imageBuffer = sharp(Buffer.from(files[file].buffer))
        .resize({ width: imgWidth, height: imgHeight });
      formData.append('image', imageBuffer);
      formData.append('album', process.env.ACCESS_ALBUM);
      try {
        const axiosRes = await axios({ ...options, data: formData });
        imagesData.push({
          deleteHash: axiosRes.data.data.deletehash,
          url: axiosRes.data.data.link,
        });
      } catch {
        appError(40003, next, '圖片上傳失敗');
      }
    }
    return imagesData;
  },
  async delete(files) {
    let result = '';
    for (const deleteHash in files) {
      const settings = {
        method: "delete",
        url: `https://api.imgur.com/3/image/${files[deleteHash]}`,
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
        },
      };
      try {
        const axiosRes = await axios(settings);
        if (axiosRes.data.success) {
          result = '圖片刪除成功';
        }
      } catch {
        appError(40003, next, '圖片刪除失敗');
      }
    }
    return result
  }
}

module.exports = Imgur;