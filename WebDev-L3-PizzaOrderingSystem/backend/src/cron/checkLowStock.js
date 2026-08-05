const cron = require("node-cron");
const Inventory = require("../models/inventoryModel");
const transporter = require("../config/mailer");
const User = require("../models/userModel");
const { renderEmail } = require("../utils/emailTemplate");

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
        <tr>
          <td style="padding:10px 12px;font-family:Arial, Helvetica, sans-serif;font-size:13px;color:#1c1917;border-bottom:1px solid #f0e9e2;">${item.name}</td>
          <td style="padding:10px 12px;font-family:Arial, Helvetica, sans-serif;font-size:13px;color:#78716c;border-bottom:1px solid #f0e9e2;text-transform:capitalize;">${item.category}</td>
          <td style="padding:10px 12px;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:700;color:#b91c1c;border-bottom:1px solid #f0e9e2;">${item.stock} ${item.unit}</td>
        </tr>`;
    }

    const html = renderEmail({
      title: "Low stock alert",
      greeting: `Hello ${admin.name},`,
      bodyHtml: `
        <p style="margin:0 0 14px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.6;color:#44403c;">
          The following inventory items are running low and need to be restocked:
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e9e2;border-radius:8px;overflow:hidden;">
          <tr>
            <th style="padding:10px 12px;text-align:left;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#c2410c;border-bottom:1px solid #f0e9e2;">Item</th>
            <th style="padding:10px 12px;text-align:left;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#c2410c;border-bottom:1px solid #f0e9e2;">Category</th>
            <th style="padding:10px 12px;text-align:left;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#c2410c;border-bottom:1px solid #f0e9e2;">Remaining</th>
          </tr>
          ${itemList}
        </table>`,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: "Low Stock Alert — PizzaNova",
      html,
    });

    for (const item of lowStockItems) {
      item.lowStockAlertSent = true;
      await item.save();
    }
  } catch (error) {
    console.error(error);
  }
});
