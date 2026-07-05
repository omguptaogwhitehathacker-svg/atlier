require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    await User.create([
      { email: 'owner@admin.com', password: 'password123', name: 'Owner', role: 'owner' },
      { email: 'admin@admin.com', password: 'password123', name: 'Admin Manager', role: 'admin' },
      { email: 'staff@admin.com', password: 'password123', name: 'Staff Member', role: 'staff' },
      { email: 'customer@example.com', password: 'password123', name: 'Test Customer', role: 'customer' }
    ]);

    await Category.create([
      { name: 'Electronics' },
      { name: 'Fashion' },
      { name: 'Home & Living' },
      { name: 'Kitchen' },
      { name: 'Beauty & Wellness' },
      { name: 'Accessories' }
    ]);

    await Product.create([
      {
        name: 'Wireless Noise‑Cancelling Headphones',
        category: 'Electronics',
        description: 'Premium ANC, 30h battery.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        sellingPrice: 2499,
        costPrice: 980,
        stock: 45,
        variations: [{ type: 'Color', values: ['Black', 'White', 'Blue'] }],
        reviews: [{ name: 'Alice', rating: 5, comment: 'Amazing sound!' }]
      },
      {
        name: 'Cashmere Blend Crewneck Sweater',
        category: 'Fashion',
        description: 'Ultra‑soft cashmere‑merino.',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop',
        sellingPrice: 3899,
        costPrice: 1450,
        stock: 32,
        variations: [{ type: 'Size', values: ['S', 'M', 'L', 'XL'] }]
      },
      {
        name: 'Handcrafted Ceramic Vase Set',
        category: 'Home & Living',
        description: 'Set of three stoneware vases.',
        imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=400&h=300&fit=crop',
        sellingPrice: 1899,
        costPrice: 620,
        stock: 28
      },
      {
        name: "Professional Chef's Knife 8‑Inch",
        category: 'Kitchen',
        description: 'High‑carbon steel, walnut handle.',
        imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&h=300&fit=crop',
        sellingPrice: 1499,
        costPrice: 510,
        stock: 55
      },
      {
        name: 'Ultrasonic Essential Oil Diffuser',
        category: 'Beauty & Wellness',
        description: '500ml, auto shut‑off.',
        imageUrl: 'https://images.unsplash.com/photo-1602928298849-325cec8771c0?w=400&h=300&fit=crop',
        sellingPrice: 2199,
        costPrice: 780,
        stock: 40
      },
      {
        name: 'Full‑Grain Leather Tote Bag',
        category: 'Accessories',
        description: 'Hand‑stitched leather, laptop sleeve.',
        imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=300&fit=crop',
        sellingPrice: 2999,
        costPrice: 1120,
        stock: 22
      },
      {
        name: 'Smart Fitness Watch Pro',
        category: 'Electronics',
        description: 'AMOLED, GPS, SpO2.',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
        sellingPrice: 4599,
        costPrice: 1850,
        stock: 38
      },
      {
        name: 'Stonewashed Linen Tablecloth',
        category: 'Home & Living',
        description: 'Pure flax linen.',
        imageUrl: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=400&h=300&fit=crop',
        sellingPrice: 1299,
        costPrice: 420,
        stock: 48
      }
    ]);

    console.log('✅ Database seeded!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}
seed();