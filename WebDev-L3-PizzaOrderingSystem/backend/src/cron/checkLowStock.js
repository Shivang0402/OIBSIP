const cron = require("node-cron");
const Inventory = require("../models/inventoryModel");
const transporter = require("../config/mailer");
const User = require("../models/userModel");

cron.schedule("* * * * *", async () => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: {
        $lte: ["$stock", "$threshold"],
      },
      isAvailable: true,
      lowStockAlertSent: false,
    });

    if (lowStockItems.length === 0) {
      console.log("No low stock items.");
      return;
    }

    const admin = await User.findOne({
      role: "admin",
    });

    if (!admin) {
      console.log("Admin not found.");
      return;
    }

    let itemList = "";

    for (const item of lowStockItems) {
      itemList += `
        <li>
          <strong>${item.name}</strong>
          (${item.category}) - ${item.stock} remaining
        </li>
      `;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <h2> Low Stock Alert - PizzaExpress</h2>
      <p>The following inventory items are running low:</p>
      <ul>
        ${itemList}
      </ul>
      <p>Please restock these items as soon as possible.</p>
      <hr>
      <p>
        Regards,<br>
        <strong>PizzaExpress Inventory System</strong>
      </p>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: admin.email,
      subject: "Low Stock Alert",
      html,
    });

    for (const item of lowStockItems) {
      item.lowStockAlertSent = true;
      await item.save();
    }
    console.log("Low stock alert email sent.");
  } catch (error) {
    console.error(error);
  }
});
