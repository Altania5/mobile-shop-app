const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  slug: { type: String, required: true, unique: true },
  allowLikes: { type: Boolean, default: true },
  allowComments: { type: Boolean, default: true },
  heroImage: { type: String },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
