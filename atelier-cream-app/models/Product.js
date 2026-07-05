const mongoose = require('mongoose');

const variationSchema = new mongoose.Schema({ type: String, values: [String] });
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  description: String,
  imageUrl: String,
  sellingPrice: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  variations: [variationSchema],
  reviews: [reviewSchema],
  isArchived: { type: Boolean, default: false },
  profitMargin: { type: Number, default: 0 },
  restockCost: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function(next) {
  if (this.sellingPrice > 0) this.profitMargin = ((this.sellingPrice - this.costPrice) / this.sellingPrice) * 100;
  next();
});

productSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  return this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);