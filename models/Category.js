const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  createdAt: { type: Date, default: Date.now }
});
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  next();
});
module.exports = mongoose.model('Category', categorySchema);