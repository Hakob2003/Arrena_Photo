/**
 * Stripe Cleanup Script
 * Отменяет все incomplete подписки для указанного клиента.
 * Использование: node scripts/stripe-cleanup.js
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error("Ошибка: Установите переменную STRIPE_SECRET_KEY.");
  process.exit(1);
}

const path = require("path");
const Stripe = require(path.join(__dirname, "..", "apps", "backend-api", "node_modules", "stripe"));
const stripe = new Stripe(STRIPE_SECRET_KEY);

const CUSTOMER_ID = "cus_UsbIXvLHziy95X";
const BATCH_SIZE = 100;

async function cancelIncompleteSubscriptions() {
  console.log(`\n🔍 Поиск incomplete подписок для клиента ${CUSTOMER_ID}...\n`);

  let cancelledCount = 0;
  let hasMore = true;
  let startingAfter = undefined;

  while (hasMore) {
    const params = {
      customer: CUSTOMER_ID,
      status: "incomplete",
      limit: BATCH_SIZE,
    };

    if (startingAfter) {
      params.starting_after = startingAfter;
    }

    const subscriptions = await stripe.subscriptions.list(params);

    if (subscriptions.data.length === 0) {
      hasMore = false;
      break;
    }

    for (const sub of subscriptions.data) {
      try {
        await stripe.subscriptions.cancel(sub.id);
        cancelledCount++;
        if (cancelledCount % 10 === 0) {
          console.log(`  ✅ Отменено ${cancelledCount} подписок...`);
        }
      } catch (err) {
        console.error(`  ❌ Ошибка при отмене ${sub.id}: ${err.message}`);
      }
    }

    hasMore = subscriptions.has_more;
    if (hasMore) {
      startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
    }
  }

  console.log(`\n✅ Завершено! Отменено подписок: ${cancelledCount}`);

  // Проверяем оставшееся количество
  const remaining = await stripe.subscriptions.list({
    customer: CUSTOMER_ID,
    status: "incomplete",
    limit: 1,
  });

  console.log(`📊 Осталось incomplete подписок: ${remaining.data.length > 0 ? "есть ещё" : "0"}`);
}

cancelIncompleteSubscriptions().catch((err) => {
  console.error("Критическая ошибка:", err);
  process.exit(1);
});
