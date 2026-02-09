export type Language = 'en' | 'ru' | 'uk';

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
    missingLetter: string;
    extraLetter: string;
    spellWord: string;
    syllables: string;
    sentences: string;
    audioPicture: string;
    mix: string;
    default: string;
  };

  // Game type names
  gameTypes: {
    findPicture: string;
    findLetter: string;
    removeExtra: string;
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
  syllables: string;
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
      missingLetter: string;
      extraLetter: string;
      spellWord: string;
      syllables: string;
      sentenceGame: string;
      audioPicture: string;
      mix: string;
    };
  };

  // Game type names for GameTitle
  pictureMatch: string;
  missingLetter: string;
  extraLetter: string;
  spellWord: string;
  sentences: string;
  audioPicture: string;
  gameInstructions: string;
}
