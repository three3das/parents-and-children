// ⚠️ Раньше здесь были только 4 языка ('en' | 'ru' | 'uk' | 'sa'), хотя
// колесо выбора языка на IshvaraPage.tsx предлагает 12. Из-за этого
// LanguageContext.tsx (см. getStoredLanguage) отбрасывал любой код языка
// за пределами этих четырёх и откатывал выбор обратно на Санскрит при
// перечтении из localStorage — именно поэтому игра "Алфавит" всегда
// показывала только санскритский алфавит, что бы ни было выбрано в меню.
export type Language =
  | 'sa'
  | 'en'
  | 'ar'
  | 'bn'
  | 'id'
  | 'es'
  | 'pt'
  | 'ru'
  | 'uk'
  | 'ur'
  | 'fr'
  | 'hi';

// Единый список всех поддерживаемых кодов языка — используется в
// LanguageContext.tsx для проверки значения, прочитанного из
// localStorage. Если в будущем добавляется новый язык, его код нужно
// внести И сюда, И в languageOptions в IshvaraPage.tsx (с тем же
// кодом, что и в таблице public.letter_writing_systems в Supabase) —
// иначе повторится тот же баг.
export const SUPPORTED_LANGUAGE_CODES: readonly Language[] = [
  'sa', 'en', 'ar', 'bn', 'id', 'es', 'pt', 'ru', 'uk', 'ur', 'fr', 'hi',
];

export interface Translations {
  // Header
  settings: string;
  goalReached: string;
  almostDone: string;

  // Loading states
  loadingWords: string;
  preparingTask: string;
  preparingLetters: string;
  creatingTask: string;
  loadingSyllables: string;
  loadingImages: string;
  loadingOptions: string;
  loading: string;

  // Empty / error states (shown when a game's API request succeeds but
  // returns no usable data, or when the request itself fails)
  noDataAvailable: string;
  loadingError: string;

  // Game completion
  congratulations: string;
  completedAllWords: string;
  correctAnswersToday: string;
  playAgain: string;

  // Settings
  settingsTitle: string;
  settingsDescription: string;
  resetProgress: string;

  // Game instructions
  howToPlay: string;
  gotIt: string;
  instructions: {
    pictureMatch: string;
    spellWord: string;
    syllables: string;
    sentences: string;
    audioPicture: string;
    audioSentence: string;
    default: string;
  };

  // Game type names
  gameTypes: {
    findPicture: string;
    spellWord: string;
  };

  // Results screen
  results: string;
  correctAnswers: string;
  totalQuestions: string;
  skipped: string;
  percentage: string;
  question: string;
  of: string;

  // Syllables game
  chooseCorrectEnding: string;
  correctAnswer: string;

  // Sentence game
  event: string;
  syllablesLabel: string;
  syllablesNotSpecified: string;

  // Buttons
  next: string;
  skip: string;

  // Celebration messages
  celebrations: readonly string[];

  // Authentication
  auth: {
    login: string;
    createAccount: string;
    logout: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    forgotPassword: string;
    orContinueWith: string;
    continueWithGoogle: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    signInHere: string;
    createAccountHere: string;
    loginRequired: string;
    passwordRequirements: {
      title: string;
      length: string;
      number: string;
      uppercase: string;
      lowercase: string;
    };
    newsletter: string;
    termsText: string;
    termsLink: string;
    privacyLink: string;
  };

  // Progress modal
  progress: {
    title: string;
    correct: string;
    incorrect: string;
    fromDate: string;
    toDate: string;
    summary: string;
    attempted: string;
    skipped: string;
    noData: string;
    gameNames: {
      pictureMatch: string;
      spellWord: string;
      syllables: string;
      sentenceGame: string;
      audioPicture: string;
      audioSentence: string;
    };
  };

  // Home page
  home: {
    title: string;
    subtitle: string;
  };

  // Modal messages
  modal: {
    accessDenied: string;
    accessDeniedMessage: string;
    register: string;
    signIn: string;
    subscriptionRequired: string;
    subscriptionMessage: string;
    getSubscription: string;
  };

  // Game type names for GameTitle
  pictureMatch: string;
  spellWord: string;
  syllables: string;
  sentences: string;
  audioPicture: string;
  audioSentence: string;
  gameInstructions: string;
}