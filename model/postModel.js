const {Schema, model} = require('mongoose');
const postSchema = new Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: "user",
      required: [true, "{PATH} 為必要欄位"]
    },
    content: {
      type: String,
      required: [true, "{PATH} 為必要欄位"]
    },
    image: [{
      url: String,
      deleteHash: String,
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        type: Schema.ObjectId,
        ref: "user",
      },
    ]
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// 接續 commentsModel.js
// 留言設計成 virtual，是因為，若留言量大時，筆數過多，容量大小容易超過伺服器上限
// 所以採用額外掛載的方式進行，也就是 virtual，特性是不會儲存在真實資料表上，只有在查詢時會出現
// 下面的意義是，postSchema 加載一個 virtual 欄位，名為 'comments'
// 內容關聯 comment 資料表，將資料拉回 post 資料表中
// 記得再去 getPosts 做關聯，否則不會出現 comments 欄位
postSchema.virtual('comments', {
  ref: 'comment',       // 要關聯查詢的資料表
  foreignField: 'post', // 要查詢對方的欄位名稱
  localField: '_id'     // 關聯本地的欄位名稱
});

const Post = model('post', postSchema);
module.exports = Post;