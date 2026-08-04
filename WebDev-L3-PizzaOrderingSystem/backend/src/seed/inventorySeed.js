require("dotenv").config();
const connectDb = require("../config/db");
const Inventory = require("../models/inventoryModel");

const APP_ITEMS = [
  ...["Thin Crust", "Thick Crust", "Cheese Burst", "Stuffed Crust", "Whole Wheat"].map(
    (name) => ({ name, category: "base", unit: "pieces" }),
  ),
  ...["Classic Tomato", "Spicy Tomato", "BBQ", "Pesto", "White Garlic"].map((name) => ({
    name,
    category: "sauce",
    unit: "litre",
  })),
  ...["Mozzarella", "Cheddar", "Parmesan", "Processed Cheese", "Vegan Cheese"].map(
    (name) => ({ name, category: "cheese", unit: "kg" }),
  ),
  ...[
    "Onion",
    "Tomato",
    "Capsicum",
    "Jalapeño",
    "Sweet Corn",
    "Mushroom",
    "Black Olive",
    "Green Olive",
    "Paneer",
    "Broccoli",
  ].map((name) => ({ name, category: "vegetable", unit: "kg" })),
];

const STOCK = 50;
const THRESHOLD = 10;

const run = async () => {
  try {
    await connectDb();

    const restockResult = await Inventory.updateMany(
      {},
      {
        $set: {
          stock: STOCK,
          threshold: THRESHOLD,
          isAvailable: true,
          lowStockAlertSent: false,
        },
      },
    );
    console.log(
      `Restocked ${restockResult.modifiedCount} existing item(s).`,
    );

    let added = 0;
    let updated = 0;

    for (const item of APP_ITEMS) {
      const result = await Inventory.updateOne(
        { name: item.name, category: item.category },
        {
          $set: {
            name: item.name,
            category: item.category,
            unit: item.unit,
            stock: STOCK,
            threshold: THRESHOLD,
            isAvailable: true,
            lowStockAlertSent: false,
          },
        },
        { upsert: true },
      );
      if (result.upsertedCount > 0) {
        added++;
      } else if (result.modifiedCount > 0) {
        updated++;
      }
    }

    const total = await Inventory.countDocuments();
    console.log(
      `App items ensured: ${APP_ITEMS.length} (${added} added, ${updated} updated).`,
    );
    console.log(`Total inventory items in database: ${total}`);

    const missing = [];
    for (const item of APP_ITEMS) {
      const found = await Inventory.findOne({
        name: item.name,
        category: item.category,
        isAvailable: true,
        stock: { $gte: 1 },
      });
      if (!found) missing.push(`${item.name} (${item.category})`);
    }
    if (missing.length > 0) {
      console.log("STILL MISSING:", missing);
    } else {
      console.log("All app items are available with stock.");
    }
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    const mongoose = require("mongoose");
    await mongoose.disconnect();
  }
};

run();
