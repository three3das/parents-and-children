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
      missingLetter: 'В слове пропущена одна буква. Выбери правильную букву из предложенных вариантов.',
      extraLetter: 'В слове есть лишняя буква. Найди и нажми на лишнюю букву, чтобы убрать её.',
      spellWord: 'Посмотри на картинку и составь слово. Перетаскивай буквы или нажимай на них, чтобы написать слово.',
      syllables: 'Посмотри на картинку и выбери правильное окончание слова из предложенных вариантов.',
      sentences: 'Прочитай предложение и найди картинку, которая соответствует описанию.',
      audioPicture: 'Послушай слово и найди правильную картинку. Язык озвучки можно переключить вверху экрана.',
      mix: 'В этом режиме каждое новое слово будет другой игрой. Следуй инструкциям для каждого задания.',
      default: 'Следуй инструкциям на экране.',
    },

    // Game type names
    gameTypes: {
      findPicture: 'Найди картинку',
      findLetter: 'Найди букву',
      removeExtra: 'Убери лишнее',
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
    syllables: 'Слоги:',
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
        pictureMatch: 'Картинки',
        missingLetter: 'Лупа',
        extraLetter: 'Корзина',
        spellWord: 'Карандаш',
        syllables: 'Кирпичи',
        sentenceGame: 'Блокнот',
        audioPicture: 'Динамик',
        mix: 'Микс',
      },
    },

    // Game type names for GameTitle
    pictureMatch: 'Картинки',
    missingLetter: 'Лупа',
    extraLetter: 'Корзина',
    spellWord: 'Буквы',
    sentences: 'Предложения',
    audioPicture: 'Аудио',
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
      missingLetter: 'One letter is missing from the word. Choose the correct letter from the options.',
      extraLetter: 'The word has an extra letter. Find and tap the extra letter to remove it.',
      spellWord: 'Look at the picture and spell the word. Drag or tap letters to write the word.',
      syllables: 'Look at the picture and choose the correct word ending from the options.',
      sentences: 'Read the sentence and find the picture that matches the description.',
      audioPicture: 'Listen to the word and find the correct picture. You can switch the audio language at the top of the screen.',
      mix: 'In this mode, each new word is a different game. Follow the instructions for each task.',
      default: 'Follow the instructions on screen.',
    },

    // Game type names
    gameTypes: {
      findPicture: 'Find picture',
      findLetter: 'Find letter',
      removeExtra: 'Remove extra',
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
    syllables: 'Syllables:',
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
        pictureMatch: 'Pictures',
        missingLetter: 'Magnifier',
        extraLetter: 'Basket',
        spellWord: 'Pencil',
        syllables: 'Bricks',
        sentenceGame: 'Notepad',
        audioPicture: 'Speaker',
        mix: 'Mix',
      },
    },

    // Game type names for GameTitle
    pictureMatch: 'Pictures',
    missingLetter: 'Magnifier',
    extraLetter: 'Basket',
    spellWord: 'Letters',
    sentences: 'Sentences',
    audioPicture: 'Audio',
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
      missingLetter: 'У слові пропущена одна літера. Вибери правильну літеру з запропонованих варіантів.',
      extraLetter: 'У слові є зайва літера. Знайди і натисни на зайву літеру, щоб прибрати її.',
      spellWord: 'Подивись на картинку і склади слово. Перетягуй літери або натискай на них, щоб написати слово.',
      syllables: 'Подивись на картинку і вибери правильне закінчення слова з варіантів.',
      sentences: 'Прочитай речення і знайди картинку, яка відповідає опису.',
      audioPicture: 'Послухай слово і знайди правильну картинку. Мову озвучки можна переключити вгорі екрана.',
      mix: 'У цьому режимі кожне нове слово буде іншою грою. Слідуй інструкціям для кожного завдання.',
      default: 'Слідуй інструкціям на екрані.',
    },

    // Game type names
    gameTypes: {
      findPicture: 'Знайди картинку',
      findLetter: 'Знайди літеру',
      removeExtra: 'Прибери зайве',
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
    syllables: 'Склади:',
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
        pictureMatch: 'Картинки',
        missingLetter: 'Лупа',
        extraLetter: 'Кошик',
        spellWord: 'Олівець',
        syllables: 'Цеглинки',
        sentenceGame: 'Блокнот',
        audioPicture: 'Динамік',
        mix: 'Мікс',
      },
    },

    // Game type names for GameTitle
    pictureMatch: 'Картинки',
    missingLetter: 'Лупа',
    extraLetter: 'Кошик',
    spellWord: 'Літери',
    sentences: 'Речення',
    audioPicture: 'Аудіо',
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
  },
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: 'EN',
  ru: 'RU',
  uk: 'UA',
};

export const DEFAULT_LANGUAGE: Language = 'ru';
