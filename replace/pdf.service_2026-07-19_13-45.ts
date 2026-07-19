import { Injectable, NotFoundException } from "@nestjs/common";
import PDFDocument = require("pdfkit");
import { PrismaService } from "../prisma/prisma.service";
import { Response } from "express";
import * as path from "path";

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async generateReceipt(
    paymentId: string,
    userId: string,
    lang: string,
    res: Response,
  ) {
    // 1. Fetch the transaction
    const transaction = await this.prisma.paymentHistory.findFirst({
      where: {
        id: paymentId,
        userId: userId,
      },
      include: {
        user: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    // 2. Initialize PDFKit
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Stream the PDF back to the client
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${transaction.id}.pdf`,
    );
    doc.pipe(res);

    // 3. Register Fonts (Cyrillic support)
    // In production build, assets might be copied or we can reference them dynamically.
    const fontRegularPath = path.join(
      process.cwd(),
      "src",
      "assets",
      "fonts",
      "Roboto-Regular.ttf",
    );
    const fontBoldPath = path.join(
      process.cwd(),
      "src",
      "assets",
      "fonts",
      "Roboto-Bold.ttf",
    );

    let fontRegular = "Helvetica";
    let fontBold = "Helvetica-Bold";

    try {
      doc.registerFont("Roboto", fontRegularPath);
      doc.registerFont("Roboto-Bold", fontBoldPath);
      fontRegular = "Roboto";
      fontBold = "Roboto-Bold";
      doc.font(fontRegular);
    } catch (e) {
      console.warn("Fonts not found, falling back to Helvetica");
      doc.font(fontRegular);
    }

    // 4. Texts based on language
    const texts = {
      ru: {
        title: "╨Ъ╨▓╨╕╤В╨░╨╜╤Ж╨╕╤П ╨╛╨▒ ╨╛╨┐╨╗╨░╤В╨╡",
        date: "╨Ф╨░╤В╨░",
        transactionId: "ID ╤В╤А╨░╨╜╨╖╨░╨║╤Ж╨╕╨╕",
        amount: "╨б╤Г╨╝╨╝╨░",
        status: "╨б╤В╨░╤В╤Г╤Б",
        description: "╨Ю╨┐╨╕╤Б╨░╨╜╨╕╨╡",
        customer: "╨Я╨╛╨║╤Г╨┐╨░╤В╨╡╨╗╤М",
        credits: "╨Ъ╤А╨╡╨┤╨╕╤В╤Л",
        subscription: "╨Я╨╛╨┤╨┐╨╕╤Б╨║╨░",
        total: "╨Ш╤В╨╛╨│╨╛",
        success: "╨г╤Б╨┐╨╡╤И╨╜╨╛",
        pending: "╨Т ╨╛╨╢╨╕╨┤╨░╨╜╨╕╨╕",
        failed: "╨Ю╤И╨╕╨▒╨║╨░",
        refunded: "╨Т╨╛╨╖╨▓╤А╨░╤В",
      },
      en: {
        title: "Payment Receipt",
        date: "Date",
        transactionId: "Transaction ID",
        amount: "Amount",
        status: "Status",
        description: "Description",
        customer: "Customer",
        credits: "Credits",
        subscription: "Subscription",
        total: "Total",
        success: "Success",
        pending: "Pending",
        failed: "Failed",
        refunded: "Refunded",
      },
      hy: {
        title: "╒О╒│╒б╓А╒┤╒б╒╢ ╒б╒╢╒д╒╕╓А╓А╒б╒г╒л╓А",
        date: "╘▒╒┤╒╜╒б╒й╒л╒╛",
        transactionId: "╘│╒╕╓А╒о╒б╓А╓Д╒л ID",
        amount: "╘│╒╕╓В╒┤╒б╓А",
        status: "╘┐╒б╓А╒г╒б╒╛╒л╒│╒б╒п",
        description: "╒Ж╒п╒б╓А╒б╒г╓А╒╕╓В╒й╒╡╒╕╓В╒╢",
        customer: "╘│╒╢╒╕╓А╒д",
        credits: "╘┐╓А╒е╒д╒л╒┐╒╢╒е╓А",
        subscription: "╘▓╒б╒к╒б╒╢╒╕╓А╒д╒б╒г╓А╒╕╓В╒й╒╡╒╕╓В╒╢",
        total: "╘╕╒╢╒д╒б╒┤╒е╒╢╒и",
        success: "╒А╒б╒╗╒╕╒▓╒╛╒б╒о",
        pending: "╒Н╒║╒б╒╜╒╕╒▓",
        failed: "╒Н╒н╒б╒м",
        refunded: "╒О╒е╓А╒б╒д╒б╓А╒▒╒╛╒б╒о",
      },
    };

    const t = texts[lang as keyof typeof texts] || texts.ru;

    // Status map
    const statusMap = {
      SUCCESS: t.success,
      PENDING: t.pending,
      FAILED: t.failed,
      REFUNDED: t.refunded,
    };
    const translatedStatus =
      statusMap[transaction.status as keyof typeof statusMap] ||
      transaction.status;

    // 5. Draw Header
    doc.font(fontBold).fontSize(24).text("Arrena Photo", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(18).text(t.title, { align: "center" });
    doc.moveDown(2);

    // 6. Draw Content
    doc.font(fontRegular).fontSize(12);

    const startY = doc.y;

    // Left column
    doc.text(`${t.date}:`, 50, startY);
    doc
      .font(fontBold)
      .text(
        new Date(transaction.createdAt).toLocaleString(
          lang === "ru" ? "ru-RU" : "en-US",
        ),
        150,
        startY,
      );

    doc.font(fontRegular).text(`${t.transactionId}:`, 50, startY + 20);
    doc.font(fontBold).text(transaction.id, 150, startY + 20);

    doc.font(fontRegular).text(`${t.status}:`, 50, startY + 40);
    doc.font(fontBold).text(translatedStatus, 150, startY + 40);

    doc.font(fontRegular).text(`${t.customer}:`, 50, startY + 60);
    doc.font(fontBold).text(transaction.user.email || "N/A", 150, startY + 60);

    // 7. Draw Table items
    doc.moveDown(4);

    // Table Header
    const tableTop = doc.y;
    doc.font(fontBold);
    doc.text(t.description, 50, tableTop);
    doc.text(t.amount, 450, tableTop, { align: "right" });

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(500, tableTop + 15)
      .stroke();

    // Table Row
    doc.font(fontRegular);
    const tableRow = tableTop + 25;

    let desc = "";
    if (transaction.type === "CREDITS") {
      desc = `${transaction.creditsAdded || 0} ${t.credits}`;
    } else if (transaction.type === "SUBSCRIPTION") {
      desc = `${t.subscription} - ${transaction.plan || "Premium"}`;
    } else {
      desc = transaction.type;
    }

    const formattedAmount = `${(transaction.amount / 100).toFixed(2)} ${transaction.currency.toUpperCase()}`;

    doc.text(desc, 50, tableRow);
    doc.text(formattedAmount, 450, tableRow, { align: "right" });

    doc
      .moveTo(50, tableRow + 15)
      .lineTo(500, tableRow + 15)
      .stroke();

    // Total
    doc.font(fontBold);
    doc.text(`${t.total}:`, 350, tableRow + 40, { width: 90, align: "right" });
    doc.text(formattedAmount, 450, tableRow + 40, { align: "right" });

    // 8. Footer
    doc.moveDown(5);
    doc.font(fontRegular).fontSize(10).fillColor("gray");
    doc.text("Thank you for your business!", { align: "center" });

    // Finalize
    doc.end();
  }
}
