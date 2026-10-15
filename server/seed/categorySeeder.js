const Category = require("../models/Category");

const initialCategories = [
  {
    name: "Sofa Sets",
    slug: "sofa-sets",
    description: "Premium handcrafted sofas, recliners and modular sectionals.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
    status: "Active",
  },
  {
    name: "Beds",
    slug: "beds",
    description: "King and queen size storage hydraulic beds crafted with solid timber.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80",
    status: "Active",
  },
  {
    name: "Mattresses",
    slug: "mattresses",
    description: "Orthopedic memory foam and pocket spring mattresses for restorative sleep.",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80",
    status: "Active",
  },
  {
    name: "Dining Sets",
    slug: "dining-sets",
    description: "Elegant sheesham wood dining tables and matching cushioned chairs.",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80",
    status: "Active",
  },
  {
    name: "Chairs",
    slug: "chairs",
    description: "Ergonomic accent chairs, lounge seats, and executive desk chairs.",
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80",
    status: "Active",
  },
  {
    name: "TV Units",
    slug: "tv-units",
    description: "Wall mounted floating consoles and spacious media entertainment centers.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80",
    status: "Active",
  },
  {
    name: "Storage",
    slug: "storage",
    description: "Multi-door wardrobes, shoe racks, chests of drawers, and book cases.",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80",
    status: "Active",
  },
  {
    name: "Tables",
    slug: "tables",
    description: "Modern center coffee tables, nesting side tables, and study desks.",
    image: "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?auto=format&fit=crop&w=400&q=80",
    status: "Active",
  },
];

const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(initialCategories);
      console.log(`✅ Default categories seeded successfully (${initialCategories.length} categories)`);
    } else {
      console.log(`ℹ️ Categories in DB: ${count}`);
    }
  } catch (err) {
    console.error("❌ Category seeder error:", err.message);
  }
};

module.exports = seedCategories;
