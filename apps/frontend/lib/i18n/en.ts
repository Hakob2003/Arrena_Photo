// English translations
const en: Record<string, string> = {
  // === Navigation (Sidebar) ===
  'nav.home': 'Home',
  'nav.generator': 'Generator',
  'nav.templates': 'Templates',
  'nav.marketplace': 'Marketplace',
  'nav.gallery': 'Gallery',
  'nav.myGenerations': 'My Generations',
  'nav.myTemplates': 'My Templates',
  'nav.aiProviders': 'AI Providers',
  'nav.cloud': 'Cloud',
  'nav.profile': 'Profile',
  'nav.billing': 'Billing & Plans',
  'nav.sectionOverview': 'Overview',
  'nav.sectionStudio': 'Studio',
  'nav.sectionSettings': 'Settings',
  'nav.adminPanel': 'Admin Panel',
  'nav.goToAdmin': 'Go to Admin',
  'nav.admin': 'Admin',

  // === Auth ===
  'auth.login': 'Login',
  'auth.register': 'Sign Up',
  'auth.logout': 'Logout',
  'auth.credits': 'Credits',
  'auth.loginTitle': 'Sign In',
  'auth.password': 'Password',
  'auth.name': 'Name',
  'auth.orLoginWith': 'Or sign in with',
  'auth.noAccount': "Don't have an account?",
  'auth.registerLink': 'Sign Up',
  'auth.hasAccount': 'Already have an account?',
  'auth.loginLink': 'Sign In',
  'auth.registerSuccess': 'Registration successful! Check your email.',
  'auth.invalidToken': 'Invalid authorization token',
  'auth.loading': 'Loading...',

  // === Verify ===
  'verify.title': 'Email Verification',
  'verify.checking': 'Verifying token...',
  'verify.tokenNotFound': 'Verification token not found.',
  'verify.success': 'Email verified successfully!',
  'verify.backToLogin': 'Back to login page',

  // === Home Page ===
  'home.heroTitle1': 'IMAGINATION',
  'home.heroTitle2': 'BEYOND REALITY',
  'home.heroDescription': 'The ultimate AI studio. Combine models, use professional prompts and create perfect images.',
  'home.startGenerating': 'Start Generating',
  'home.goToMarketplace': 'Go to Marketplace',

  // === Generator Page ===
  'gen.sourcePhoto': 'Source Photo (Optional)',
  'gen.remove': 'Remove',
  'gen.dropzone': 'Drag & drop a photo here or click to browse',
  'gen.dropzoneFormats': 'Supported formats: JPG, PNG',
  'gen.promptTitle': 'Prompt (Description)',
  'gen.promptPlaceholder': 'A futuristic cyberpunk city at night, neon lights reflecting in puddles...',
  'gen.modelTitle': 'Model & Settings',
  'gen.aspectRatio': 'Aspect Ratio',
  'gen.resolution': 'Resolution (Quality)',
  'gen.generating': 'Generating...',
  'gen.createButton': 'Create',
  'gen.creditsUnit': 'Credits',
  'gen.sendingPrompt': 'Sending prompt...',
  'gen.inQueue': 'In queue...',
  'gen.generatingStatus': 'Generating...',
  'gen.timeoutError': 'Generation timed out. Please try again later.',
  'gen.failedError': 'Generation failed!',
  'gen.creditsError': 'Not enough credits for generation!',
  'gen.requestError': 'Error sending generation request',
  'gen.waitingPrompt': 'Waiting for your prompt...',
  'gen.galleryTitle': 'My Generations (Google Drive)',
  'gen.galleryEmpty': 'History is empty. Create your first image!',

  // === Marketplace ===
  'market.title': 'AI Templates Marketplace',
  'market.description': 'Discover thousands of ready-made AI prompts created by top authors.',
  'market.all': 'All',
  'market.free': 'Free',
  'market.premium': 'Premium',

  // === Gallery ===
  'gallery.title': 'Community Gallery',
  'gallery.description': 'See what other users are creating right now.',
  'gallery.popular': 'Popular',
  'gallery.new': 'New',
  'gallery.best': 'Best',
  'gallery.remix': 'Remix',

  // === Templates ===
  'templates.title': 'Prompt Templates',
  'templates.description': 'Start creating with perfectly crafted prompts.',
  'templates.all': 'All',
  'templates.emptyCategory': 'No templates in this category yet.',

  // === My Generations ===
  'myGen.title': 'My Generations',
  'myGen.description': 'All your generated images',
  'myGen.refresh': 'Refresh',
  'myGen.loginRequired': 'Login Required',
  'myGen.loginDescription': 'Sign in to view your generation history.',
  'myGen.empty': 'No Generations Yet',
  'myGen.emptyDescription': "You haven't created any images yet. Go to the Generator and create your first one!",
  'myGen.goToGenerator': 'Go to Generator',
  'myGen.savedToDrive': 'Saved to Google Drive!',
  'myGen.driveNotConnected': 'Google Drive not connected. Link it in Cloud Storage settings.',
  'myGen.saveError': 'Error saving to Google Drive',
  'myGen.alreadySaved': 'Already saved',
  'myGen.saveToDrive': 'Save to Google Drive',
  'myGen.template': 'Template',

  // === My Templates ===
  'myTpl.title': 'My Templates',
  'myTpl.description': 'Manage your created prompts and templates.',
  'myTpl.create': '+ Create',
  'myTpl.empty': 'No Templates Yet',
  'myTpl.emptyDescription': "You haven't created any templates yet. Package your best prompts into a template and share or sell them on the marketplace.",
  'myTpl.goToGenerator': 'Go to Generator',

  // === Profile ===
  'profile.personal': 'Personal Information',
  'profile.security': 'Security & Access',
  'profile.appearance': 'Appearance',
  'profile.billing': 'Billing & Plans',
  'profile.notifications': 'Notifications',
  'profile.statistics': 'Statistics',
  'profile.activity': 'Activity History',

  // === Billing ===
  'billing.title': 'Billing & Plans',
  'billing.description': 'Manage your plan, credits and payment methods.',
  'billing.overview': 'Overview',
  'billing.plans': 'Plans & Credits',
  'billing.usage': 'AI Usage',
  'billing.payment': 'Payment Settings',
  'billing.lowCreditsTitle': 'Less than 20% credits remaining',
  'billing.lowCreditsDescription': 'We recommend topping up your balance or upgrading your plan to avoid interruptions.',
  'billing.topUp': 'Top Up',
};

export default en;
