import fs from 'fs';
import path from 'path';

function appendTranslations(file: string, isEn: boolean) {
  let content = fs.readFileSync(file, 'utf-8');
  // Remove the last '};\n\nexport default '
  content = content.replace(/};\s*export default [ruen]+;\s*$/, '');
  
  const ruNew = `
  // === Profile/Billing Overview ===
  'billing.overview.active': 'Активна',
  'billing.overview.free': 'Бесплатно',
  'billing.overview.activeUntil': 'Подписка активна до',
  'billing.overview.perMonth': '/ мес',
  'billing.overview.creditsLeft': 'Остаток кредитов',
  'billing.overview.outOf': 'из',
  'billing.overview.usedPeriod': 'Использовано за период',
  'billing.overview.creditsWord': 'кредитов',
  'billing.overview.features': 'Доступные функции тарифа:',
  'billing.overview.manage': 'Управление подпиской',
  'billing.overview.manageDesc': 'Измените тариф, обновите метод оплаты или отмените подписку.',
  'billing.overview.changePlan': 'Сменить тариф',
  'billing.overview.cancelPlan': 'Отменить',
  'billing.overview.stats': 'Статистика за месяц',
  'billing.overview.usedCredits': 'Использовано кредитов',
  'billing.overview.imagesGenerated': 'Генерации изображений',
  'billing.overview.viewStats': 'Смотреть детальную статистику →',
  'billing.overview.cancelModalTitle': 'Отмена подписки',
  'billing.overview.cancelModalDesc1': 'Вы уверены, что хотите отменить подписку',
  'billing.overview.cancelModalDesc2': 'У вас останется доступ к функциям до конца оплаченного периода',
  'billing.overview.cancelModalDesc3': 'после чего тариф будет изменен на Free, а неиспользованные кредиты сгорят.',
  'billing.overview.yesCancel': 'Да, отменить подписку',
  'billing.overview.noCancel': 'Я передумал(а)',

  // === Profile/Billing Plans ===
  'billing.plans.title': 'Доступные тарифы',
  'billing.plans.yourPlan': 'Ваш тариф',
  'billing.plans.perMonth': '/ мес',
  'billing.plans.credits': 'кредитов',
  'billing.plans.currentPlan': 'Текущий план',
  'billing.plans.buyCredits': 'Разовое пополнение кредитов',
  'billing.plans.buyCreditsDesc': 'Купленные кредиты не сгорают в конце месяца и расходуются в первую очередь.',
  'billing.plans.promoTitle': 'Активация промокода',
  'billing.plans.promoDesc': 'Если у вас есть подарочный код или купон на скидку, введите его здесь.',
  'billing.plans.apply': 'Применить',
  'billing.plans.promoError': 'Неверный или истекший промокод.',
  'billing.plans.promoApplied': 'Промокод применен!',
  'billing.plans.promoDiscount': 'Скидка 20% применена!',
  'billing.plans.promoNext': 'Будет применена к следующему списанию.',
  'billing.plans.free100': 'Вам начислено 100 кредитов!',
  'billing.plans.upgradeSuccess': 'Тариф успешно изменен!',
  'billing.plans.paymentError': 'Ошибка оплаты',
  'billing.plans.creditsSuccess': 'Кредиты успешно начислены!',

  // === Profile/Billing Usage ===
  'billing.usage.title': 'Использование AI',
  'billing.usage.desc': 'Детализация расхода кредитов за текущий месяц',
  'billing.usage.totalSpent': 'Всего потрачено',
  'billing.usage.imageGen': 'Генерация картинок',
  'billing.usage.templates': 'Использование шаблонов',
  'billing.usage.api': 'API вызовы',
  'billing.usage.chartTitle': 'Расход кредитов',

  // === Profile/Billing Payment ===
  'billing.payment.title': 'Методы оплаты',
  'billing.payment.desc': 'Добавьте карту для автоматического продления подписки.',
  'billing.payment.addCard': '+ Добавить карту',
  'billing.payment.defaultCard': 'Основная',
  'billing.payment.makeDefault': 'Сделать основной',
  'billing.payment.delete': 'Удалить',
  'billing.payment.billingHistory': 'История платежей',
  'billing.payment.date': 'Дата',
  'billing.payment.amount': 'Сумма',
  'billing.payment.status': 'Статус',
  'billing.payment.invoice': 'Чек',
  'billing.payment.statusSuccess': 'Оплачено',
  'billing.payment.statusFailed': 'Ошибка',
  'billing.payment.download': 'Скачать',

  // === Profile Pages ===
  'profile.personal.title': 'Личная информация',
  'profile.personal.desc': 'Обновите свое имя и контактные данные.',
  'profile.personal.avatar': 'Аватар профиля',
  'profile.personal.upload': 'Загрузить',
  'profile.personal.remove': 'Удалить',
  'profile.personal.name': 'Полное имя',
  'profile.personal.email': 'Email адрес',
  'profile.personal.save': 'Сохранить изменения',

  'profile.security.title': 'Безопасность',
  'profile.security.desc': 'Управление паролями и защита аккаунта.',
  'profile.security.changePassword': 'Смена пароля',
  'profile.security.currentPassword': 'Текущий пароль',
  'profile.security.newPassword': 'Новый пароль',
  'profile.security.confirmPassword': 'Подтвердите новый пароль',
  'profile.security.sessions': 'Активные сессии',
  'profile.security.terminate': 'Завершить',

  'profile.appearance.title': 'Оформление',
  'profile.appearance.desc': 'Настройте внешний вид приложения.',
  'profile.appearance.theme': 'Тема оформления',
  'profile.appearance.dark': 'Тёмная',
  'profile.appearance.light': 'Светлая',
  'profile.appearance.system': 'Системная',
  'profile.appearance.accent': 'Цвет акцента',

  'profile.notifications.title': 'Уведомления',
  'profile.notifications.desc': 'Настройка email и push уведомлений.',
  'profile.notifications.email': 'Email уведомления',
  'profile.notifications.push': 'Push уведомления',
  'profile.notifications.updates': 'Обновления и новости',
  'profile.notifications.billing': 'Биллинг и подписки',

  'profile.statistics.title': 'Статистика',
  'profile.statistics.desc': 'Аналитика вашего использования AI.',

  'profile.activity.title': 'История активности',
  'profile.activity.desc': 'Журнал действий в вашем аккаунте.',
};

export default ru;
`;

  const enNew = `
  // === Profile/Billing Overview ===
  'billing.overview.active': 'Active',
  'billing.overview.free': 'Free',
  'billing.overview.activeUntil': 'Subscription active until',
  'billing.overview.perMonth': '/ mo',
  'billing.overview.creditsLeft': 'Credits Left',
  'billing.overview.outOf': 'out of',
  'billing.overview.usedPeriod': 'Used in period',
  'billing.overview.creditsWord': 'credits',
  'billing.overview.features': 'Available plan features:',
  'billing.overview.manage': 'Manage Subscription',
  'billing.overview.manageDesc': 'Change your plan, update payment method, or cancel your subscription.',
  'billing.overview.changePlan': 'Change Plan',
  'billing.overview.cancelPlan': 'Cancel',
  'billing.overview.stats': 'Monthly Statistics',
  'billing.overview.usedCredits': 'Credits used',
  'billing.overview.imagesGenerated': 'Images generated',
  'billing.overview.viewStats': 'View detailed statistics →',
  'billing.overview.cancelModalTitle': 'Cancel Subscription',
  'billing.overview.cancelModalDesc1': 'Are you sure you want to cancel the subscription',
  'billing.overview.cancelModalDesc2': 'You will have access to features until the end of the paid period',
  'billing.overview.cancelModalDesc3': 'after which the plan will be changed to Free, and unused credits will expire.',
  'billing.overview.yesCancel': 'Yes, cancel subscription',
  'billing.overview.noCancel': 'I changed my mind',

  // === Profile/Billing Plans ===
  'billing.plans.title': 'Available Plans',
  'billing.plans.yourPlan': 'Your Plan',
  'billing.plans.perMonth': '/ mo',
  'billing.plans.credits': 'credits',
  'billing.plans.currentPlan': 'Current Plan',
  'billing.plans.buyCredits': 'One-time Credits Top Up',
  'billing.plans.buyCreditsDesc': 'Purchased credits do not expire and are used first.',
  'billing.plans.promoTitle': 'Activate Promo Code',
  'billing.plans.promoDesc': 'If you have a gift code or discount coupon, enter it here.',
  'billing.plans.apply': 'Apply',
  'billing.plans.promoError': 'Invalid or expired promo code.',
  'billing.plans.promoApplied': 'Promo code applied!',
  'billing.plans.promoDiscount': '20% discount applied!',
  'billing.plans.promoNext': 'Will be applied to your next billing.',
  'billing.plans.free100': 'You received 100 credits!',
  'billing.plans.upgradeSuccess': 'Plan successfully changed!',
  'billing.plans.paymentError': 'Payment error',
  'billing.plans.creditsSuccess': 'Credits successfully added!',

  // === Profile/Billing Usage ===
  'billing.usage.title': 'AI Usage',
  'billing.usage.desc': 'Detailed breakdown of credit usage for the current month',
  'billing.usage.totalSpent': 'Total Spent',
  'billing.usage.imageGen': 'Image Generation',
  'billing.usage.templates': 'Template Usage',
  'billing.usage.api': 'API Calls',
  'billing.usage.chartTitle': 'Credit Usage',

  // === Profile/Billing Payment ===
  'billing.payment.title': 'Payment Methods',
  'billing.payment.desc': 'Add a card for automatic subscription renewal.',
  'billing.payment.addCard': '+ Add Card',
  'billing.payment.defaultCard': 'Default',
  'billing.payment.makeDefault': 'Make Default',
  'billing.payment.delete': 'Delete',
  'billing.payment.billingHistory': 'Billing History',
  'billing.payment.date': 'Date',
  'billing.payment.amount': 'Amount',
  'billing.payment.status': 'Status',
  'billing.payment.invoice': 'Invoice',
  'billing.payment.statusSuccess': 'Paid',
  'billing.payment.statusFailed': 'Failed',
  'billing.payment.download': 'Download',

  // === Profile Pages ===
  'profile.personal.title': 'Personal Information',
  'profile.personal.desc': 'Update your name and contact details.',
  'profile.personal.avatar': 'Profile Avatar',
  'profile.personal.upload': 'Upload',
  'profile.personal.remove': 'Remove',
  'profile.personal.name': 'Full Name',
  'profile.personal.email': 'Email Address',
  'profile.personal.save': 'Save Changes',

  'profile.security.title': 'Security',
  'profile.security.desc': 'Manage passwords and secure your account.',
  'profile.security.changePassword': 'Change Password',
  'profile.security.currentPassword': 'Current Password',
  'profile.security.newPassword': 'New Password',
  'profile.security.confirmPassword': 'Confirm New Password',
  'profile.security.sessions': 'Active Sessions',
  'profile.security.terminate': 'Terminate',

  'profile.appearance.title': 'Appearance',
  'profile.appearance.desc': 'Customize the app interface.',
  'profile.appearance.theme': 'Theme',
  'profile.appearance.dark': 'Dark',
  'profile.appearance.light': 'Light',
  'profile.appearance.system': 'System',
  'profile.appearance.accent': 'Accent Color',

  'profile.notifications.title': 'Notifications',
  'profile.notifications.desc': 'Manage email and push notifications.',
  'profile.notifications.email': 'Email Notifications',
  'profile.notifications.push': 'Push Notifications',
  'profile.notifications.updates': 'Updates & News',
  'profile.notifications.billing': 'Billing & Subscriptions',

  'profile.statistics.title': 'Statistics',
  'profile.statistics.desc': 'Analytics for your AI usage.',

  'profile.activity.title': 'Activity History',
  'profile.activity.desc': 'Log of actions in your account.',
};

export default en;
`;

  fs.writeFileSync(file, content + (isEn ? enNew : ruNew));
}

appendTranslations('f:/Arrena_Photo/apps/frontend/lib/i18n/ru.ts', false);
appendTranslations('f:/Arrena_Photo/apps/frontend/lib/i18n/en.ts', true);
