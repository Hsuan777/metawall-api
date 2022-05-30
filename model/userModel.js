const {Schema, model} = require('mongoose');
const userScheam = new Schema(
  {
    name: {
      type: String,
      required: [true, '{PATH} 為必要欄位']
    },
    email: {
      type: String,
      required: [true, '{PATH} 為必要欄位'],
      unique: true,
      lowercase: true,
      select: false
    },
    avatar: {
      type: String,
      default: "https://fakeimg.pl/50x50/",
    },
    sex: {
      type: String,
      enum: ['male', 'female', ""]
    },
    password: {
      type: String,
      required: [true, '{PATH} 為必要欄位'],
      minlength: 8,
      select: false
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    },
    followers: [
      {
        user: { 
          type: Schema.ObjectId, 
          ref: 'User' 
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    following: [
      {
        user: { 
          type: Schema.ObjectId, 
          ref: 'User' 
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    versionKey: false
  }
)
const User = model('user', userScheam);
module.exports = User;