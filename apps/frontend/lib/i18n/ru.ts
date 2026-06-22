// Russian translations
const ru: Record<string, string> = {
  // === Navigation (Sidebar) ===
  'nav.home': 'Главная',
  'nav.generator': 'Генератор',
  'nav.templates': 'Шаблоны',
  'nav.marketplace': 'Маркетплейс',
  'nav.gallery': 'Галерея',
  'nav.myGenerations': 'Мои генерации',
  'nav.myTemplates': 'Мои шаблоны',
  'nav.aiProviders': 'AI Провайдеры',
  'nav.cloud': 'Облако',
  'nav.profile': 'Профиль',
  'nav.billing': 'Подписки и платежи',
  'nav.sectionOverview': 'Обзор',
  'nav.sectionStudio': 'Студия',
  'nav.sectionSettings': 'Настройки',
  'nav.adminPanel': 'Админ Панель',
  'nav.goToAdmin': 'Перейти в Админку',
  'nav.admin': 'Админка',

  // === Auth ===
  'auth.login': 'Войти',
  'auth.register': 'Регистрация',
  'auth.logout': 'Выйти',
  'auth.credits': 'Кредиты',
  'auth.loginTitle': 'Вход',
  'auth.password': 'Пароль',
  'auth.name': 'Имя',
  'auth.orLoginWith': 'Или войти через',
  'auth.noAccount': 'Нет аккаунта?',
  'auth.registerLink': 'Зарегистрироваться',
  'auth.hasAccount': 'Уже есть аккаунт?',
  'auth.loginLink': 'Войти',
  'auth.registerSuccess': 'Регистрация успешна! Проверьте вашу почту.',
  'auth.invalidToken': 'Неверный токен авторизации',
  'auth.loading': 'Загрузка...',

  // === Verify ===
  'verify.title': 'Подтверждение Email',
  'verify.checking': 'Проверка токена...',
  'verify.tokenNotFound': 'Токен подтверждения не найден.',
  'verify.success': 'Email успешно подтвержден!',
  'verify.backToLogin': 'Вернуться на страницу входа',

  // === Home Page ===
  'home.heroTitle1': 'ВООБРАЖЕНИЕ',
  'home.heroTitle2': 'ВНЕ РЕАЛЬНОСТИ',
  'home.heroDescription': 'Ультимативная AI-студия. Объединяйте модели, используйте профессиональные промпты и создавайте идеальные изображения.',
  'home.startGenerating': 'Начать генерацию',
  'home.goToMarketplace': 'Перейти в Маркетплейс',

  // === Generator Page ===
  'gen.sourcePhoto': 'Исходное фото (Опционально)',
  'gen.remove': 'Удалить',
  'gen.dropzone': 'Перетащите фото сюда или нажмите для выбора',
  'gen.dropzoneFormats': 'Поддерживаются форматы JPG, PNG',
  'gen.promptTitle': 'Промпт (Описание)',
  'gen.promptPlaceholder': 'Футуристический киберпанк город ночью, неоновые огни отражаются в лужах...',
  'gen.modelTitle': 'Модель и Настройки',
  'gen.aspectRatio': 'Соотношение сторон (Aspect Ratio)',
  'gen.resolution': 'Разрешение (Quality)',
  'gen.generating': 'Генерация...',
  'gen.createButton': 'Создать',
  'gen.creditsUnit': 'Кредитов',
  'gen.sendingPrompt': 'Отправка промпта...',
  'gen.inQueue': 'В очереди...',
  'gen.generatingStatus': 'Генерация...',
  'gen.timeoutError': 'Превышено время ожидания генерации. Попробуйте позже.',
  'gen.failedError': 'Генерация не удалась!',
  'gen.creditsError': 'У вас недостаточно кредитов для генерации!',
  'gen.requestError': 'Ошибка при отправке запроса генерации',
  'gen.waitingPrompt': 'Ожидание вашего промпта...',
  'gen.galleryTitle': 'Мои генерации (Google Drive)',
  'gen.galleryEmpty': 'История пуста. Создайте свою первую картинку!',

  // === Marketplace ===
  'market.title': 'Маркетплейс AI Шаблонов',
  'market.description': 'Открывайте тысячи готовых AI-промптов, созданных лучшими авторами.',
  'market.all': 'Все',
  'market.free': 'Бесплатные',
  'market.premium': 'Премиум',

  // === Gallery ===
  'gallery.title': 'Галерея сообщества',
  'gallery.description': 'Смотрите, что создают другие пользователи прямо сейчас.',
  'gallery.popular': 'Популярное',
  'gallery.new': 'Новое',
  'gallery.best': 'Лучшее',
  'gallery.remix': 'Ремикс',

  // === Templates ===
  'templates.title': 'Шаблоны промптов',
  'templates.description': 'Начните создание с идеально составленных промптов.',
  'templates.all': 'Все',
  'templates.emptyCategory': 'Шаблоны в этой категории пока отсутствуют.',

  // === My Generations ===
  'myGen.title': 'Мои генерации',
  'myGen.description': 'Все ваши сгенерированные изображения',
  'myGen.refresh': 'Обновить',
  'myGen.loginRequired': 'Войдите для просмотра',
  'myGen.loginDescription': 'Войдите в аккаунт, чтобы увидеть историю генераций.',
  'myGen.empty': 'Ещё нет генераций',
  'myGen.emptyDescription': 'Вы ещё не создали ни одного изображения. Перейдите в Генератор и создайте своё первое!',
  'myGen.goToGenerator': 'Перейти в Генератор',
  'myGen.savedToDrive': 'Сохранено на Google Drive!',
  'myGen.driveNotConnected': 'Google Drive не подключен. Привяжите его в настройках Cloud Storage.',
  'myGen.saveError': 'Ошибка при сохранении на Google Drive',
  'myGen.alreadySaved': 'Уже сохранено',
  'myGen.saveToDrive': 'Сохранить на Google Drive',
  'myGen.template': 'Шаблон',

  // === My Templates ===
  'myTpl.title': 'Мои шаблоны',
  'myTpl.description': 'Управление созданными промптами и шаблонами.',
  'myTpl.create': '+ Создать',
  'myTpl.empty': 'Пока нет шаблонов',
  'myTpl.emptyDescription': 'Вы ещё не создали ни одного шаблона. Упакуйте лучшие промпты в шаблон и делитесь или продавайте на маркетплейсе.',
  'myTpl.goToGenerator': 'Перейти в Генератор',

  // === Profile ===
  'profile.personal': 'Личная информация',
  'profile.security': 'Безопасность',
  'profile.appearance': 'Оформление',
  'profile.billing': 'Подписка и платежи',
  'profile.notifications': 'Уведомления',
  'profile.statistics': 'Статистика',
  'profile.activity': 'История активности',

  // === Billing ===
  'billing.title': 'Подписка и платежи',
  'billing.description': 'Управляйте своим тарифом, кредитами и методами оплаты.',
  'billing.overview': 'Обзор',
  'billing.plans': 'Тарифы и Кредиты',
  'billing.usage': 'Использование AI',
  'billing.payment': 'Настройки оплаты',
  'billing.lowCreditsTitle': 'У вас осталось менее 20% кредитов',
  'billing.lowCreditsDescription': 'Рекомендуем пополнить баланс или перейти на более высокий тариф, чтобы не прерывать работу.',
  'billing.topUp': 'Пополнить',
};

export default ru;
