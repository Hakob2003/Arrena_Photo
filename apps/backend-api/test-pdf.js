const {
  PrismaClient,
} = require("../../packages/database/node_modules/@prisma/client");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

async function run() {
  const transaction = await prisma.paymentHistory.findFirst({
    include: { user: true },
  });
  if (!transaction) return console.log("No transactions");
  console.log("Found tx:", transaction.id);

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(fs.createWriteStream("test.pdf"));

  try {
    const lang = "ru";
    const texts = { ru: { success: "Success" } };
    const t = texts[lang];
    const statusMap = { SUCCESS: t.success };
    const translatedStatus =
      statusMap[transaction.status] || transaction.status;

    // Register fonts just like the backend
    const fontRegularPath = path.join(
      process.cwd(),
      "apps",
      "backend-api",
      "src",
      "assets",
      "fonts",
      "Roboto-Regular.ttf",
    );
    const fontBoldPath = path.join(
      process.cwd(),
      "apps",
      "backend-api",
      "src",
      "assets",
      "fonts",
      "Roboto-Bold.ttf",
    );

    try {
      doc.registerFont("Roboto", fontRegularPath);
      doc.registerFont("Roboto-Bold", fontBoldPath);
      doc.font("Roboto");
    } catch (e) {
      console.warn("Fonts not found, falling back to Helvetica");
      doc.font("Helvetica");
    }

    doc.fontSize(12);
    const startY = doc.y;
    doc.text("Date:", 50, startY);
    doc.text(new Date(transaction.createdAt).toLocaleString(), 150, startY);
    doc.text(transaction.user.email || "N/A", 150, startY + 60);

    let desc = "";
    if (transaction.type === "CREDITS") {
      desc = `${transaction.creditsAdded || 0} credits`;
    } else if (transaction.type === "SUBSCRIPTION") {
      desc = `Subscription - ${transaction.plan || "Premium"}`;
    } else {
      desc = transaction.type;
    }
    const formattedAmount = `${(transaction.amount / 100).toFixed(2)} ${(transaction.currency || "USD").toUpperCase()}`;

    doc.end();
    console.log("Done");
  } catch (e) {
    console.error("ERROR GENERATING:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
