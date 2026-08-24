import type { Language, Translations } from './types';

export const translations: Record<Language, Translations> = {
  ru: {
    // Header
    settings: 'Настройки',
    goalReached: 'Цель достигнута!',
    almostDone: 'Почти готово!',

    // Loading states
    loadingWords: 'Загружаем слова...',
    preparingTask: 'Подготавливаем задание...',
    preparingLetters: 'Подготавливаем буквы...',
    creatingTask: 'Создаем задание...',
    loadingSyllables: 'Загружаем слоги...',
    loadingImages: 'Загрузка изображений...',
    loadingOptions: 'Загружаем варианты...',
    loading: 'Загрузка...',

    // Empty / error states
    noDataAvailable: 'Нет данных для этой игры',
    loadingError: 'Ошибка загрузки данных',

    // Game completion
    congratulations: 'Поздравляем!',
    completedAllWords: 'Ты прошёл все слова!',
    correctAnswersToday: 'Сегодня правильных ответов:',
    playAgain: 'Играть снова!',

    // Settings
    settingsTitle: 'Настройки',
    settingsDescription: 'Чтобы сбросить прогресс и начать заново, нажмите здесь',
    resetProgress: 'Сбросить прогресс',

    // Game instructions
    howToPlay: 'Как играть',
    gotIt: 'Понятно!',
    instructions: {
      pictureMatch: 'Посмотри на слово и найди правильную картинку. Нажми на картинку, которая соответствует слову.',
      spellWord: 'Посмотри на картинку и составь слово. Перетаскивай буквы или нажимай на них, чтобы написать слово.',
      syllables: 'Посмотри на картинку и выбери правильное окончание слова из предложенных вариантов.',
      sentences: 'Прочитай предложение и найди картинку, которая соответствует описанию.',
      audioPicture: 'Послушай слово и найди правильную картинку. Язык озвучки можно переключить вверху экрана.',
      audioSentence: 'Послушай предложение и найди картинку, которая соответствует описанию.',
      default: 'Следуй инструкциям на экране.',
    },

    // Game type names
    gameTypes: {
      findPicture: 'Найди картинку',
      spellWord: 'Составь слово',
    },

    // Results screen
    results: 'Результаты',
    correctAnswers: 'Правильных ответов:',
    totalQuestions: 'Всего вопросов:',
    skipped: 'Пропущено:',
    percentage: 'Процент:',
    question: 'Вопрос',
    of: 'из',

    // Syllables game
    chooseCorrectEnding: 'Выберите правильное окончание слова:',
    correctAnswer: 'Правильный ответ:',

    // Sentence game
    event: 'Событие:',
    syllablesLabel: 'Слоги:',
    syllablesNotSpecified: 'Слоги не указаны',

    // Buttons
    next: 'Далее',
    skip: 'Пропустить',

    // Celebrations
    celebrations: [
      'Отлично!',
      'Молодец!',
      'Супер!',
      'Правильно!',
      'Умница!',
      'Здорово!',
      'Прекрасно!',
      'Чудесно!',
      'Великолепно!',
      'Браво!'
    ],

    // Progress
    progress: {
      title: 'Прогресс',
      fromDate: 'С какого дня',
      toDate: 'По какой день',
      attempted: 'Попытки',
      correct: 'Правильно',
      incorrect: 'Ошибки',
      skipped: 'Пропущено',
      summary: 'Итого',
      noData: 'Нет данных за выбранный период',
      gameNames: {
        pictureMatch: 'Чтение слова',
        spellWord: 'Составление слова',
        syllables: 'Нахождение слога',
        sentenceGame: 'Чтение предложения',
        audioPicture: 'Слушание слова',
        audioSentence: 'Слушание предложения',
      },
    },

    // Home page
    home: {
      title: 'Знания для детей',
      subtitle: 'Учиться интересно и весело!',
    },

    // Game type names for GameTitle
    pictureMatch: 'Чтение слова',
    spellWord: 'Составление слова',
    syllables: 'Нахождение слога',
    sentences: 'Чтение предложения',
    audioPicture: 'Слушание слова',
    audioSentence: 'Слушание предложения',
    gameInstructions: 'Выполни задание',

    // Authentication
    auth: {
      login: 'Войти',
      createAccount: 'Регистрация',
      logout: 'Выйти',
      email: 'Электронная почта',
      password: 'Пароль',
      firstName: 'Имя',
      lastName: 'Фамилия',
      forgotPassword: 'Забыли пароль?',
      orContinueWith: 'или продолжить с',
      continueWithGoogle: 'Продолжить с Google',
      alreadyHaveAccount: 'Уже есть аккаунт?',
      dontHaveAccount: 'Нет аккаунта?',
      signInHere: 'Войдите здесь',
      createAccountHere: 'Создайте здесь',
      loginRequired: 'Войдите, чтобы играть',
      passwordRequirements: {
        title: 'Пароль должен содержать:',
        length: '8 или более символов',
        number: 'Минимум 1 цифру',
        uppercase: 'Минимум 1 заглавную букву',
        lowercase: 'Минимум 1 строчную букву',
      },
      newsletter: 'Хочу получать новости и обновления по email',
      termsText: 'Создавая аккаунт, вы соглашаетесь с',
      termsLink: 'Условиями использования',
      privacyLink: 'Политикой конфиденциальности',
    },

    // Modal messages
    modal: {
      accessDenied: 'Добро пожаловать!',
      accessDeniedMessage: 'Чтобы пользоваться этим разделом, пожалуйста, пройдите регистрацию и оформите подписку для полного доступа ко всем возможностям.',
      register: 'Зарегистрироваться',
      signIn: 'Войти',
      subscriptionRequired: 'Отличный выбор!',
      subscriptionMessage: 'Осталось только оформить подписку, чтобы открыть все задания и возможности!',
      getSubscription: 'Оформить подписку',
    },
  },

  en: {
    // Header
    settings: 'Settings',
    goalReached: 'Goal reached!',
    almostDone: 'Almost done!',

    // Loading states
    loadingWords: 'Loading words...',
    preparingTask: 'Preparing task...',
    preparingLetters: 'Preparing letters...',
    creatingTask: 'Creating task...',
    loadingSyllables: 'Loading syllables...',
    loadingImages: 'Loading images...',
    loadingOptions: 'Loading options...',
    loading: 'Loading...',

    // Empty / error states
    noDataAvailable: 'No data available for this game',
    loadingError: 'Error loading data',

    // Game completion
    congratulations: 'Congratulations!',
    completedAllWords: 'You completed all words!',
    correctAnswersToday: 'Correct answers today:',
    playAgain: 'Play again!',

    // Settings
    settingsTitle: 'Settings',
    settingsDescription: 'Click here to reset progress and start over',
    resetProgress: 'Reset progress',

    // Game instructions
    howToPlay: 'How to play',
    gotIt: 'Got it!',
    instructions: {
      pictureMatch: 'Look at the word and find the correct picture. Tap the picture that matches the word.',
      spellWord: 'Look at the picture and spell the word. Drag or tap letters to write the word.',
      syllables: 'Look at the picture and choose the correct word ending from the options.',
      sentences: 'Read the sentence and find the picture that matches the description.',
      audioPicture: 'Listen to the word and find the correct picture. You can switch the audio language at the top of the screen.',
      audioSentence: 'Listen to the sentence and find the picture that matches the description.',
      default: 'Follow the instructions on screen.',
    },

    // Game type names
    gameTypes: {
      findPicture: 'Find picture',
      spellWord: 'Spell word',
    },

    // Results screen
    results: 'Results',
    correctAnswers: 'Correct answers:',
    totalQuestions: 'Total questions:',
    skipped: 'Skipped:',
    percentage: 'Percentage:',
    question: 'Question',
    of: 'of',

    // Syllables game
    chooseCorrectEnding: 'Choose the correct word ending:',
    correctAnswer: 'Correct answer:',

    // Sentence game
    event: 'Event:',
    syllablesLabel: 'Syllables:',
    syllablesNotSpecified: 'Syllables not specified',

    // Buttons
    next: 'Next',
    skip: 'Skip',

    // Celebrations
    celebrations: [
      'Excellent!',
      'Well done!',
      'Super!',
      'Correct!',
      'Great job!',
      'Awesome!',
      'Wonderful!',
      'Amazing!',
      'Magnificent!',
      'Bravo!'
    ],

    // Progress
    progress: {
      title: 'Progress',
      fromDate: 'From date',
      toDate: 'To date',
      attempted: 'Attempted',
      correct: 'Correct',
      incorrect: 'Incorrect',
      skipped: 'Skipped',
      summary: 'Summary',
      noData: 'No data for selected period',
      gameNames: {
        pictureMatch: 'Reading the word',
        spellWord: 'Word composition',
        syllables: 'Finding syllable',
        sentenceGame: 'Reading sentence',
        audioPicture: 'Listening to word',
        audioSentence: 'Listening to sentence',
      },
    },

    // Home page
    home: {
      title: 'Knowledge for Children',
      subtitle: 'Learning is fun and exciting!',
    },

    // Game type names for GameTitle
    pictureMatch: 'Reading the word',
    spellWord: 'Word composition',
    syllables: 'Finding syllable',
    sentences: 'Reading sentence',
    audioPicture: 'Listening to word',
    audioSentence: 'Listening to sentence',
    gameInstructions: 'Complete the task',

    // Authentication
    auth: {
      login: 'Log in',
      createAccount: 'Registration',
      logout: 'Log out',
      email: 'Email',
      password: 'Password',
      firstName: 'First name',
      lastName: 'Last name',
      forgotPassword: 'Forgot password?',
      orContinueWith: 'or continue with',
      continueWithGoogle: 'Continue with Google',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      signInHere: 'Sign in here',
      createAccountHere: 'Create one here',
      loginRequired: 'Please log in to play',
      passwordRequirements: {
        title: 'Password must contain:',
        length: '8 or more characters',
        number: 'At least 1 number',
        uppercase: 'At least 1 uppercase letter',
        lowercase: 'At least 1 lowercase letter',
      },
      newsletter: 'I want to receive news and updates via email',
      termsText: 'By creating an account, you agree to our',
      termsLink: 'Terms of Service',
      privacyLink: 'Privacy Policy',
    },

    // Modal messages
    modal: {
      accessDenied: 'Welcome!',
      accessDeniedMessage: 'To use this section, please register and subscribe for full access to all features.',
      register: 'Register',
      signIn: 'Sign In',
      subscriptionRequired: 'Great choice!',
      subscriptionMessage: 'Just subscribe to unlock all tasks and features!',
      getSubscription: 'Get Subscription',
    },
  },

  uk: {
    // Header
    settings: 'Налаштування',
    goalReached: 'Мета досягнута!',
    almostDone: 'Майже готово!',

    // Loading states
    loadingWords: 'Завантажуємо слова...',
    preparingTask: 'Готуємо завдання...',
    preparingLetters: 'Готуємо літери...',
    creatingTask: 'Створюємо завдання...',
    loadingSyllables: 'Завантажуємо склади...',
    loadingImages: 'Завантаження зображень...',
    loadingOptions: 'Завантажуємо варіанти...',
    loading: 'Завантаження...',

    // Empty / error states
    noDataAvailable: 'Немає даних для цієї гри',
    loadingError: 'Помилка завантаження даних',

    // Game completion
    congratulations: 'Вітаємо!',
    completedAllWords: 'Ти пройшов усі слова!',
    correctAnswersToday: 'Сьогодні правильних відповідей:',
    playAgain: 'Грати знову!',

    // Settings
    settingsTitle: 'Налаштування',
    settingsDescription: 'Натисніть тут, щоб скинути прогрес і почати спочатку',
    resetProgress: 'Скинути прогрес',

    // Game instructions
    howToPlay: 'Як грати',
    gotIt: 'Зрозуміло!',
    instructions: {
      pictureMatch: 'Подивись на слово і знайди правильну картинку. Натисни на картинку, яка відповідає слову.',
      spellWord: 'Подивись на картинку і склади слово. Перетягуй літери або натискай на них, щоб написати слово.',
      syllables: 'Подивись на картинку і вибери правильне закінчення слова з варіантів.',
      sentences: 'Прочитай речення і знайди картинку, яка відповідає опису.',
      audioPicture: 'Послухай слово і знайди правильну картинку. Мову озвучки можна переключити вгорі екрана.',
      audioSentence: 'Послухай речення і знайди картинку, яка відповідає опису.',
      default: 'Слідуй інструкціям на екрані.',
    },

    // Game type names
    gameTypes: {
      findPicture: 'Знайди картинку',
      spellWord: 'Склади слово',
    },

    // Results screen
    results: 'Результати',
    correctAnswers: 'Правильних відповідей:',
    totalQuestions: 'Всього питань:',
    skipped: 'Пропущено:',
    percentage: 'Відсоток:',
    question: 'Питання',
    of: 'з',

    // Syllables game
    chooseCorrectEnding: 'Виберіть правильне закінчення слова:',
    correctAnswer: 'Правильна відповідь:',

    // Sentence game
    event: 'Подія:',
    syllablesLabel: 'Склади:',
    syllablesNotSpecified: 'Склади не вказані',

    // Buttons
    next: 'Далі',
    skip: 'Пропустити',

    // Celebrations
    celebrations: [
      'Чудово!',
      'Молодець!',
      'Супер!',
      'Правильно!',
      'Розумниця!',
      'Здорово!',
      'Прекрасно!',
      'Дивовижно!',
      'Чудово!',
      'Браво!'
    ],

    // Progress
    progress: {
      title: 'Прогрес',
      fromDate: 'З якого дня',
      toDate: 'По який день',
      attempted: 'Спроби',
      correct: 'Правильно',
      incorrect: 'Помилки',
      skipped: 'Пропущено',
      summary: 'Підсумок',
      noData: 'Немає даних за вибраний період',
      gameNames: {
        pictureMatch: 'Читання слова',
        spellWord: 'Складання слова',
        syllables: 'Знаходження складу',
        sentenceGame: 'Читання речення',
        audioPicture: 'Слухання слова',
        audioSentence: 'Слухання речення',
      },
    },

    // Home page
    home: {
      title: 'Знання для дітей',
      subtitle: 'Навчатись цікаво і весело!',
    },

    // Game type names for GameTitle
    pictureMatch: 'Читання слова',
    spellWord: 'Складання слова',
    syllables: 'Знаходження складу',
    sentences: 'Читання речення',
    audioPicture: 'Слухання слова',
    audioSentence: 'Слухання речення',
    gameInstructions: 'Виконай завдання',

    // Authentication
    auth: {
      login: 'Увійти',
      createAccount: 'Реєстрація',
      logout: 'Вийти',
      email: 'Електронна пошта',
      password: 'Пароль',
      firstName: "Ім'я",
      lastName: 'Прізвище',
      forgotPassword: 'Забули пароль?',
      orContinueWith: 'або продовжити з',
      continueWithGoogle: 'Продовжити з Google',
      alreadyHaveAccount: 'Вже є акаунт?',
      dontHaveAccount: 'Немає акаунту?',
      signInHere: 'Увійдіть тут',
      createAccountHere: 'Створіть тут',
      loginRequired: 'Увійдіть, щоб грати',
      passwordRequirements: {
        title: 'Пароль повинен містити:',
        length: '8 або більше символів',
        number: 'Мінімум 1 цифру',
        uppercase: 'Мінімум 1 велику літеру',
        lowercase: 'Мінімум 1 малу літеру',
      },
      newsletter: 'Хочу отримувати новини та оновлення по email',
      termsText: 'Створюючи акаунт, ви погоджуєтесь з',
      termsLink: 'Умовами використання',
      privacyLink: 'Політикою конфіденційності',
    },

    // Modal messages
    modal: {
      accessDenied: 'Вітаю Вас!',
      accessDeniedMessage: 'Будь-ласка, використовуйте даний розділ за допомогою "Оформлення підписки та підтвердження авторизації" для повного доступу до всіх можливостей.',
      register: 'Зареєструватися',
      signIn: 'Увійти',
      subscriptionRequired: 'Чудовий вибір!',
      subscriptionMessage: 'Залишилось лише оформити підписку, щоб відкрити всі завдання та можливості!',
      getSubscription: 'Оформити підписку',
    },
  },

  sa: {
    // Header
    settings: 'सेटिंग्स (Seṭiṅgs)',
    goalReached: 'लक्ष्य प्राप्त! (Lakṣya prāpta!)',
    almostDone: 'लगभग पूर्ण! (Lagabhaga pūrṇa!)',

    // Loading states
    loadingWords: 'शब्दाः लोड्यन्ते... (Śabdāḥ loḍyante...)',
    preparingTask: 'कार्यं तैयार्यते... (Kāryaṃ taiyāryate...)',
    preparingLetters: 'अक्षराणि तैयार्यन्ते... (Akṣarāṇi taiyāryante...)',
    creatingTask: 'कार्यं सृज्यते... (Kāryaṃ sṛjyate...)',
    loadingSyllables: 'अक्षराणि लोड्यन्ते... (Akṣarāṇi loḍyante...)',
    loadingImages: 'चित्राणि लोड्यन्ते... (Citrāṇi loḍyante...)',
    loadingOptions: 'विकल्पाः लोड्यन्ते... (Vikalpāḥ loḍyante...)',
    loading: 'लोडिंग... (Loḍiṅg...)',

    // Empty / error states
    noDataAvailable: 'अस्याः क्रीडायाः कृते दत्तांशः नास्ति (Asyāḥ krīḍāyāḥ kṛte dattāṃśaḥ nāsti)',
    loadingError: 'दत्तांश-लोडने त्रुटिः (Dattāṃśa-loḍane truṭiḥ)',

    // Game completion
    congratulations: 'अभिनन्दनम्! (Abhinandanam!)',
    completedAllWords: 'त्वं सर्वाणि शब्दानि पूर्णानि कृतवान्! (Tvaṃ sarvāṇi śabdāni pūrṇāni kṛtavān!)',
    correctAnswersToday: 'अद्य सम्यक् उत्तराणि: (Adya samyak uttarāṇi:)',
    playAgain: 'पुनः क्रीड! (Punaḥ krīḍa!)',

    // Settings
    settingsTitle: 'सेटिंग्स (Seṭiṅgs)',
    settingsDescription: 'प्रगतिं पुनः स्थापयितुं अत्र क्लिक् कुरु (Pragatiṃ punaḥ sthāpayituṃ atra klik kuru)',
    resetProgress: 'प्रगतिं पुनः स्थापय (Pragatiṃ punaḥ sthāpaya)',

    // Game instructions
    howToPlay: 'कथं क्रीडितव्यम् (Kathaṃ krīḍitavyam)',
    gotIt: 'अवगतम्! (Avagatam!)',
    instructions: {
      pictureMatch: 'शब्दं पश्य चित्रं च सम्यक् अन्विष्य। शब्देन सह योज्यमानं चित्रं स्पृश। (Śabdaṃ paśya citraṃ ca samyak anviṣya. Śabdena saha yojyamānaṃ citraṃ spṛśa.)',
      spellWord: 'चित्रं पश्य शब्दं च रच। अक्षराणि आकर्षय वा स्पृश वा। (Citraṃ paśya śabdaṃ ca raca. Akṣarāṇi ākarṣaya vā spṛśa vā.)',
      syllables: 'चित्रं पश्य शब्दस्य सम्यक् अन्तं च चिनु। (Citraṃ paśya śabdasya samyak antaṃ ca cinu.)',
      sentences: 'वाक्यं पठ वर्णनेन सह योज्यमानं चित्रं च अन्विष्य। (Vākyaṃ paṭha varṇanena saha yojyamānaṃ citraṃ ca anviṣya.)',
      audioPicture: 'शब्दं शृणु सम्यक् चित्रं च अन्विष्य। ध्वनि-भाषां ऊर्ध्वे परिवर्तयितुं शक्यते। (Śabdaṃ śṛṇu samyak citraṃ ca anviṣya. Dhvani-bhāṣāṃ ūrdhve parivartayituṃ śakyate.)',
      audioSentence: 'वाक्यं शृणु वर्णनेन सह योज्यमानं चित्रं च अन्विष्य। (Vākyaṃ śṛṇu varṇanena saha yojyamānaṃ citraṃ ca anviṣya.)',
      default: 'पर्दायाः निर्देशान् अनुसर। (Pardāyāḥ nirdeśān anusara.)',
    },

    // Game type names
    gameTypes: {
      findPicture: 'चित्रं अन्विष्य (Citraṃ anviṣya)',
      spellWord: 'शब्दं रच (Śabdaṃ raca)',
    },

    // Results screen
    results: 'परिणामाः (Pariṇāmāḥ)',
    correctAnswers: 'सम्यक् उत्तराणि: (Samyak uttarāṇi:)',
    totalQuestions: 'कुल प्रश्नाः: (Kula praśnāḥ:)',
    skipped: 'त्यक्तम्: (Tyaktam:)',
    percentage: 'प्रतिशतम्: (Pratiśatam:)',
    question: 'प्रश्नः (Praśnaḥ)',
    of: 'तः (Taḥ)',

    // Syllables game
    chooseCorrectEnding: 'शब्दस्य सम्यक् अन्तं चिनु: (Śabdasya samyak antaṃ cinu:)',
    correctAnswer: 'सम्यक् उत्तरम्: (Samyak uttaram:)',

    // Sentence game
    event: 'घटना: (Ghaṭanā:)',
    syllablesLabel: 'अक्षराणि: (Akṣarāṇi:)',
    syllablesNotSpecified: 'अक्षराणि न निर्दिष्टानि (Akṣarāṇi na nirdiṣṭāni)',

    // Buttons
    next: 'अग्रे (Agre)',
    skip: 'त्यज (Tyaja)',

    // Celebrations
    celebrations: [
      'उत्तमम्! (Uttamam!)',
      'साधु! (Sādhu!)',
      'सुन्दरम्! (Sundaram!)',
      'सम्यक्! (Samyak!)',
      'बुद्धिमान्! (Buddhimān!)',
      'शोभनम्! (Śobhanam!)',
      'प्रशस्तम्! (Praśastam!)',
      'आश्चर्यम्! (Āścaryam!)',
      'महत्! (Mahat!)',
      'धन्यवादः! (Dhanyavādaḥ!)'
    ],

    // Progress
    progress: {
      title: 'प्रगतिः (Pragatiḥ)',
      fromDate: 'दिनाङ्कतः (Dināṅkataḥ)',
      toDate: 'दिनाङ्कपर्यन्तम् (Dināṅkaparyantam)',
      attempted: 'प्रयत्नाः (Prayatnāḥ)',
      correct: 'सम्यक् (Samyak)',
      incorrect: 'असम्यक् (Asamyak)',
      skipped: 'त्यक्तम् (Tyaktam)',
      summary: 'सारांशः (Sārāṃśaḥ)',
      noData: 'चयनिते कालखण्डे दत्तांशः नास्ति (Cayanite kālakhaṇḍe dattāṃśaḥ nāsti)',
      gameNames: {
        pictureMatch: 'शब्द-पठनम् (Śabda-paṭhanam)',
        spellWord: 'शब्द-रचना (Śabda-racanā)',
        syllables: 'अक्षर-अन्वेषणम् (Akṣara-anveṣaṇam)',
        sentenceGame: 'वाक्य-पठनम् (Vākya-paṭhanam)',
        audioPicture: 'शब्द-श्रवणम् (Śabda-śravaṇam)',
        audioSentence: 'वाक्य-श्रवणम् (Vākya-śravaṇam)',
      },
    },

    // Home page
    home: {
      title: 'बालानां ज्ञानम् (Bālānāṃ jñānam)',
      subtitle: 'शिक्षणं रोचकं च आनन्दप्रदं च! (Śikṣaṇaṃ rocakaṃ ca ānandapradaṃ ca!)',
    },

    // Game type names for GameTitle
    pictureMatch: 'शब्द-पठनम् (Śabda-paṭhanam)',
    spellWord: 'शब्द-रचना (Śabda-racanā)',
    syllables: 'अक्षर-अन्वेषणम् (Akṣara-anveṣaṇam)',
    sentences: 'वाक्य-पठनम् (Vākya-paṭhanam)',
    audioPicture: 'शब्द-श्रवणम् (Śabda-śravaṇam)',
    audioSentence: 'वाक्य-श्रवणम् (Vākya-śravaṇam)',
    gameInstructions: 'कार्यं पूरय (Kāryaṃ pūraya)',

    // Authentication
    auth: {
      login: 'प्रवेशः (Praveśaḥ)',
      createAccount: 'पञ्जीकरणम् (Pañjīkaraṇam)',
      logout: 'निर्गमः (Nirgamaḥ)',
      email: 'ईमेल (Īmel)',
      password: 'गुप्तशब्दः (Guptaśabdaḥ)',
      firstName: 'प्रथम-नाम (Prathama-nāma)',
      lastName: 'कुल-नाम (Kula-nāma)',
      forgotPassword: 'गुप्तशब्दं विस्मृतवान्? (Guptaśabdaṃ vismṛtavān?)',
      orContinueWith: 'अथवा एतेन सह चल (Athavā etena saha cala)',
      continueWithGoogle: 'गूगलेन सह चल (Gūgalena saha cala)',
      alreadyHaveAccount: 'खाता अस्ति किम्? (Khātā asti kim?)',
      dontHaveAccount: 'खाता नास्ति किम्? (Khātā nāsti kim?)',
      signInHere: 'अत्र प्रविश (Atra praviśa)',
      createAccountHere: 'अत्र सृज (Atra sṛja)',
      loginRequired: 'क्रीडितुं प्रविश (Krīḍituṃ praviśa)',
      passwordRequirements: {
        title: 'गुप्तशब्दे भवेत्: (Guptaśabde bhavet:)',
        length: '८ वा अधिकानि चिह्नानि (8 vā adhikāni cihnāni)',
        number: 'न्यूनतमम् १ अङ्कः (Nyūnatamam 1 aṅkaḥ)',
        uppercase: 'न्यूनतमम् १ बृहत् अक्षरम् (Nyūnatamam 1 bṛhat akṣaram)',
        lowercase: 'न्यूनतमम् १ लघु अक्षरम् (Nyūnatamam 1 laghu akṣaram)',
      },
      newsletter: 'ईमेलद्वारा समाचारान् अद्यतनानि च प्राप्तुम् इच्छामि (Īmeldvārā samācārān adyatanāni ca prāptum icchāmi)',
      termsText: 'खातां सृजन् त्वं अङ्गीकरोषि (Khātāṃ sṛjan tvaṃ aṅgīkaroṣi)',
      termsLink: 'उपयोग-शर्ताः (Upayoga-śartāḥ)',
      privacyLink: 'गोपनीयता-नीतिः (Gopanīyatā-nītiḥ)',
    },

    // Modal messages
    modal: {
      accessDenied: 'स्वागतम्! (Svāgatam!)',
      accessDeniedMessage: 'एतस्य विभागस्य उपयोगाय पञ्जीकरणं कुरु सदस्यतां च प्राप्नुहि सर्वेषां सुविधानां पूर्ण-प्रवेशाय। (Etasya vibhāgasya upayogāya pañjīkaraṇaṃ kuru sadasyatāṃ ca prāpnuhi sarveṣāṃ suvidhānāṃ pūrṇa-praveśāya.)',
      register: 'पञ्जीकरणम् (Pañjīkaraṇam)',
      signIn: 'प्रवेशः (Praveśaḥ)',
      subscriptionRequired: 'उत्तमः चयनः! (Uttamaḥ cayanaḥ!)',
      subscriptionMessage: 'सर्वाणि कार्याणि सुविधाश्च उद्घाटयितुं केवलं सदस्यतां प्राप्नुहि! (Sarvāṇi kāryāṇi suvidhāśca udghaṭayituṃ kevalaṃ sadasyatāṃ prāpnuhi!)',
      getSubscription: 'सदस्यतां प्राप्नुहि (Sadasyatāṃ prāpnuhi)',
    },
  },
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: 'EN',
  ru: 'RU',
  uk: 'UA',
  sa: 'SA',
};

export const DEFAULT_LANGUAGE: Language = 'sa';