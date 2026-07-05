const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  category: String,
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: Number,
  unitCost: Number,
  lineTotal: Number,
  serial: { type: String, required: true, unique: true },
  variation: { type: { type: String }, value: String }
});

const orderSchema = new mongoose.Schema({
  customerEmail: { type: String, required: true },
  customerName: { type: String, required: true },
  shippingAddress: String,
  paymentMethod: String,
  items: [orderItemSchema],
  totalRevenue: { type: Number, required: true },
  totalCOGS: { type: Number, required: true },
  netProfit: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  restockCost: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

orderSchema.methods.generateSerials = function() {
  this.items.forEach(item => {
    const d = new Date();
    const dateStr = d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
    const randomStr = Math.random().toString(36).substring(2,8).toUpperCase();
    const code = (item.category || 'GEN').substring(0,4).toUpperCase();
    item.serial = code + '-' + dateStr + '-' + randomStr;
  });
};

module.exports = mongoose.model('Order', orderSchema);