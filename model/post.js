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
    image: {
      type:String,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    },
    likes: [
      {
        type: Schema.ObjectId,
        ref: "user",
      },
    ]
  },
  {
    versionKey: false
  }
)
const Post = model('post', postSchema);
module.exports = Post;