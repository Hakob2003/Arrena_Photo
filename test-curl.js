const axios = require("axios");
const jwt = require("jsonwebtoken");
const {
  PrismaClient,
} = require("./packages/database/node_modules/@prisma/client");

const JWT_SECRET = "local_dev_secret_jwt_key_1234567890";
const prisma = new PrismaClient();

async function run() {
  try {
    const tx = await prisma.paymentHistory.findFirst();
    if (!tx) {
      console.log("No transactions found.");
      return;
    }

    const token = jwt.sign(
      { id: tx.userId, email: "test@test.com" },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    console.log("Requesting receipt for tx:", tx.id);
    const response = await axios.get(
      `http://localhost:4000/api/v1/payment/${tx.id}/receipt?lang=ru`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
        validateStatus: () => true, // Resolve on all statuses
      },
    );

    console.log("Status:", response.status);
    console.log("Headers:", response.headers);
    if (response.status >= 400) {
      // It's a buffer, convert to string
      console.error("Error Response Data:", response.data.toString());
    } else {
      console.log("Success! Data length:", response.data.length);
    }
  } catch (err) {
    console.error("Fetch Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
