import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

const menuItems = [
  // Noodles with Regular and Large - create 2 separate items
  { name: 'VEG. NOODLES (Regular)', price: 500, category: 'noodles' },
  { name: 'VEG. NOODLES (Large)', price: 800, category: 'noodles' },
  { name: 'EGG NOODLES (Regular)', price: 500, category: 'noodles' },
  { name: 'EGG NOODLES (Large)', price: 800, category: 'noodles' },
  { name: 'CHICKEN NOODLES (Regular)', price: 700, category: 'noodles' },
  { name: 'CHICKEN NOODLES (Large)', price: 1100, category: 'noodles' },
  { name: 'MIX NOODLES (Regular)', price: 850, category: 'noodles' },
  { name: 'MIX NOODLES (Large)', price: 1450, category: 'noodles' },
  
  // Devilled items with Regular and Large - create 2 separate items
  { name: 'CHICKEN DEVILLED (Regular)', price: 1000, category: 'bites' },
  { name: 'CHICKEN DEVILLED (Large)', price: 1450, category: 'bites' },
  { name: 'FISH DEVILLED (Regular)', price: 1100, category: 'bites' },
  { name: 'FISH DEVILLED (Large)', price: 1550, category: 'bites' },
  { name: 'PRAWNS DEVILLED (Regular)', price: 1550, category: 'bites' },
  { name: 'PRAWNS DEVILLED (Large)', price: 1900, category: 'bites' },
  
  // Single price items
  { name: 'SAUSAGE DEVILLED', price: 850, description: '1 Portion', category: 'bites' },
  { name: 'FRENCH FRIES', price: 650, description: '1 Portion', category: 'bites' },
  { name: 'SHORTIES SANDWICH', price: 350, category: 'shorties' },
  { name: 'SHAWARMA', price: 200, category: 'shorties' },
  { name: 'CUTTLETS', price: 100, category: 'shorties' },
  { name: 'STRING HOPPERS', price: 250, description: 'String Hoppers with Curry (10 Pieces)', category: 'noodles' },
  
  // Beverages
  { name: 'NES TEA', price: 100, category: 'beverages' },
  { name: 'HOT CHOCOLATE', price: 130, category: 'beverages' },
  { name: 'CARDAMOM', price: 120, category: 'beverages' },
  { name: 'NESCAFE', price: 100, category: 'beverages' },
  
  // Rice & Curry
  { name: 'VEG. RICE', price: 650, category: 'rice_curry' },
  { name: 'EGG RICE', price: 800, category: 'rice_curry' },
  { name: 'FISH RICE', price: 950, category: 'rice_curry' },
  { name: 'CHICKEN RICE', price: 1000, description: 'Include 04 currys + Fish or Meat. Add on Prowns Curry for 450.00/- Only', category: 'rice_curry' },
  
  // Fried Rice with Regular and Large
  { name: 'EGG FRIED RICE (Regular)', price: 550, category: 'fried_rice' },
  { name: 'EGG FRIED RICE (Large)', price: 900, category: 'fried_rice' },
  { name: 'CHICKEN FRIED RICE (Regular)', price: 700, category: 'fried_rice' },
  { name: 'CHICKEN FRIED RICE (Large)', price: 1200, category: 'fried_rice' },
  { name: 'SEAFOOD FRIED RICE (Regular)', price: 850, category: 'fried_rice' },
  { name: 'SEAFOOD FRIED RICE (Large)', price: 1400, category: 'fried_rice' },
  { name: 'MIX FRIED RICE (Regular)', price: 900, category: 'fried_rice' },
  { name: 'MIX FRIED RICE (Large)', price: 1600, category: 'fried_rice' },
  
  // Kottu with Regular and Large
  { name: 'EGG KOTTU (Regular)', price: 550, category: 'kottu' },
  { name: 'EGG KOTTU (Large)', price: 900, category: 'kottu' },
  { name: 'CHICKEN KOTTU (Regular)', price: 700, category: 'kottu' },
  { name: 'CHICKEN KOTTU (Large)', price: 1200, category: 'kottu' },
  { name: 'SEAFOOD KOTTU (Regular)', price: 850, category: 'kottu' },
  { name: 'SEAFOOD KOTTU (Large)', price: 1400, category: 'kottu' },
  { name: 'MIX KOTTU (Regular)', price: 900, category: 'kottu' },
  { name: 'MIX KOTTU (Large)', price: 1600, category: 'kottu' },
  { name: 'STRING HOPPERS KOTTU', price: 500, category: 'kottu' },
  { name: 'PALAJATHTHA POLWATHTHA, DENIPITIYA', price: 900, category: 'kottu' },
];

async function populateMenu() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing menu items
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');

    // Insert menu items
    const insertedItems = [];
    for (const item of menuItems) {
      const menuItem = new MenuItem(item);
      await menuItem.save();
      insertedItems.push(menuItem);
      console.log(`Inserted: ${item.name} - ${formatCurrency(item.price)}`);
    }

    console.log(`\nSuccessfully inserted ${insertedItems.length} menu items`);
    
    // Display summary by category
    const categories = ['noodles', 'bites', 'shorties', 'beverages', 'rice_curry', 'fried_rice', 'kottu'];
    console.log('\nSummary by category:');
    for (const cat of categories) {
      const count = await MenuItem.countDocuments({ category: cat });
      console.log(`  ${cat}: ${count} items`);
    }
    
    const totalItems = await MenuItem.countDocuments();
    console.log(`\nTotal menu items in database: ${totalItems}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error populating menu:', error);
    process.exit(1);
  }
}

function formatCurrency(amount) {
  return `Rs. ${amount.toLocaleString()}`;
}

populateMenu();
