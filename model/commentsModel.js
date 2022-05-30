const {Schema, model} = require('mongoose');
const commentSchema = new Schema(
  {
    comment: {
      type: String,
      required: [true, '還沒有輸入留言喔!']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // 留言者是誰
    user: {
      type: Schema.ObjectId,
      ref: 'user',
      require: ['true', '必須填入 user id (留言者)']
    },
    // 屬於哪一則貼文
    post: {
      type: Schema.ObjectId,
      ref: 'post',
      require: ['true', '必須填入 post id']
    }
  },
  {
    versionKey: false
  }
)

// 類似於路由的 middleware
// 可使用 .pre or .post，這兩種有各自的動作，譬如 'find'、'save'
// 下面的意義是，在執行 'find' 之前，commentSchema 中的 user，去關聯 user 資料表，並選擇需要的屬性
// 因 posts 會需要留言，所以回到 postModel.js，加上 comments 屬性
commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name id avatar createdAt'
  });
  next();
});

const Comment  = model('comment', commentSchema);
module.exports = Comment ;