import { db } from "../server/db";
import { words, wordTranslations } from "../shared/schema";

// Ukrainian and English translations for all words
const TRANSLATIONS: Record<string, { uk: string; en: string }> = {
  // Animals
  "СЛОН": { uk: "СЛОН", en: "ELEPHANT" },
  "КОТ": { uk: "КІТ", en: "CAT" },
  "КОШКА": { uk: "КІШКА", en: "CAT" },
  "ЛИСА": { uk: "ЛИСИЦЯ", en: "FOX" },
  "РЫБА": { uk: "РИБА", en: "FISH" },
  "СОБАКА": { uk: "СОБАКА", en: "DOG" },
  "ПТИЦА": { uk: "ПТАХ", en: "BIRD" },
  "МЕДВЕДЬ": { uk: "ВЕДМІДЬ", en: "BEAR" },
  "ЗАЯЦ": { uk: "ЗАЄЦЬ", en: "RABBIT" },
  "ВОЛК": { uk: "ВОВК", en: "WOLF" },
  "ЛЯГУШКА": { uk: "ЖАБА", en: "FROG" },
  "БАБОЧКА": { uk: "МЕТЕЛИК", en: "BUTTERFLY" },
  "ПЧЕЛА": { uk: "БДЖОЛА", en: "BEE" },
  "МЫШЬ": { uk: "МИША", en: "MOUSE" },
  "БЕЛКА": { uk: "БІЛКА", en: "SQUIRREL" },
  "ЕЖ": { uk: "ЇЖ", en: "HEDGEHOG" },
  "ГУСЬ": { uk: "ГУСКА", en: "GOOSE" },
  "ИНДЮК": { uk: "ІНДИК", en: "TURKEY" },
  "КОРОВА": { uk: "КОРОВА", en: "COW" },
  "КУРИЦА": { uk: "КУРКА", en: "CHICKEN" },
  "ЛЕВ": { uk: "ЛЕВ", en: "LION" },
  "ОЛЕНЬ": { uk: "ОЛЕНЬ", en: "DEER" },
  "СВИНЬЯ": { uk: "СВИНЯ", en: "PIG" },
  "ТИГР": { uk: "ТИГР", en: "TIGER" },
  "УТКА": { uk: "КАЧКА", en: "DUCK" },
  "ЯЩЕРИЦА": { uk: "ЯЩІРКА", en: "LIZARD" },

  // Home and objects
  "ДОМ": { uk: "ДІМ", en: "HOUSE" },
  "МЯЧ": { uk: "М'ЯЧ", en: "BALL" },
  "СТОЛ": { uk: "СТІЛ", en: "TABLE" },
  "СТУЛ": { uk: "СТІЛЕЦЬ", en: "CHAIR" },
  "ОКНО": { uk: "ВІКНО", en: "WINDOW" },
  "ДВЕРЬ": { uk: "ДВЕРІ", en: "DOOR" },
  "ЛАМПА": { uk: "ЛАМПА", en: "LAMP" },
  "ЧАСЫ": { uk: "ГОДИННИК", en: "CLOCK" },
  "ТЕЛЕФОН": { uk: "ТЕЛЕФОН", en: "PHONE" },
  "ТЕЛЕВИЗОР": { uk: "ТЕЛЕВІЗОР", en: "TV" },
  "КОМПЬЮТЕР": { uk: "КОМП'ЮТЕР", en: "COMPUTER" },
  "КНИГА": { uk: "КНИГА", en: "BOOK" },
  "КАРАНДАШ": { uk: "ОЛІВЕЦЬ", en: "PENCIL" },
  "ЗЕРКАЛО": { uk: "ДЗЕРКАЛО", en: "MIRROR" },
  "КЛЮЧ": { uk: "КЛЮЧ", en: "KEY" },
  "КРОВАТЬ": { uk: "ЛІЖКО", en: "BED" },
  "ОДЕЯЛО": { uk: "КОВДРА", en: "BLANKET" },
  "ПОДУШКА": { uk: "ПОДУШКА", en: "PILLOW" },
  "ПОЛОТЕНЦЕ": { uk: "РУШНИК", en: "TOWEL" },
  "РУЧКА": { uk: "РУЧКА", en: "PEN" },
  "СУМКА": { uk: "СУМКА", en: "BAG" },
  "МЫЛО": { uk: "МИЛО", en: "SOAP" },
  "ШЛЯПА": { uk: "КАПЕЛЮХ", en: "HAT" },
  "НОСКИ": { uk: "ШКАРПЕТКИ", en: "SOCKS" },
  "ОБУВЬ": { uk: "ВЗУТТЯ", en: "SHOES" },
  "ПАЛЬТО": { uk: "ПАЛЬТО", en: "COAT" },
  "РУБАШКА": { uk: "СОРОЧКА", en: "SHIRT" },
  "ЮБКА": { uk: "СПІДНИЦЯ", en: "SKIRT" },

  // Nature
  "ЦВЕТОК": { uk: "КВІТКА", en: "FLOWER" },
  "ДЕРЕВО": { uk: "ДЕРЕВО", en: "TREE" },
  "СОЛНЦЕ": { uk: "СОНЦЕ", en: "SUN" },
  "ЛУНА": { uk: "МІСЯЦЬ", en: "MOON" },
  "ЗВЕЗДА": { uk: "ЗІРКА", en: "STAR" },
  "ОБЛАКО": { uk: "ХМАРА", en: "CLOUD" },
  "ВОДА": { uk: "ВОДА", en: "WATER" },
  "ОГОНЬ": { uk: "ВОГОНЬ", en: "FIRE" },
  "ЗЕМЛЯ": { uk: "ЗЕМЛЯ", en: "EARTH" },
  "НЕБО": { uk: "НЕБО", en: "SKY" },
  "ВЕТЕР": { uk: "ВІТЕР", en: "WIND" },
  "СНЕГ": { uk: "СНІГ", en: "SNOW" },
  "ДОЖДЬ": { uk: "ДОЩ", en: "RAIN" },
  "БЕРЕГ": { uk: "БЕРЕГ", en: "SHORE" },
  "ГРОЗА": { uk: "ГРОЗА", en: "THUNDERSTORM" },
  "ЛЕС": { uk: "ЛІС", en: "FOREST" },
  "ЛИСТ": { uk: "ЛИСТОК", en: "LEAF" },
  "МОЛНИЯ": { uk: "БЛИСКАВКА", en: "LIGHTNING" },
  "МОРЕ": { uk: "МОРЕ", en: "SEA" },
  "ОЗЕРО": { uk: "ОЗЕРО", en: "LAKE" },
  "ОСТРОВ": { uk: "ОСТРІВ", en: "ISLAND" },
  "ПОЛЕ": { uk: "ПОЛЕ", en: "FIELD" },
  "РАДУГА": { uk: "ВЕСЕЛКА", en: "RAINBOW" },
  "РЕКА": { uk: "РІЧКА", en: "RIVER" },
  "ТРАВА": { uk: "ТРАВА", en: "GRASS" },
  "ПЕЩЕРА": { uk: "ПЕЧЕРА", en: "CAVE" },
  "ПУСТЫНЯ": { uk: "ПУСТЕЛЯ", en: "DESERT" },

  // Food
  "ХЛЕБ": { uk: "ХЛІБ", en: "BREAD" },
  "МОЛОКО": { uk: "МОЛОКО", en: "MILK" },
  "ЯБЛОКО": { uk: "ЯБЛУКО", en: "APPLE" },
  "БАНАН": { uk: "БАНАН", en: "BANANA" },
  "ГРУША": { uk: "ГРУША", en: "PEAR" },
  "ЛИМОН": { uk: "ЛИМОН", en: "LEMON" },
  "АПЕЛЬСИН": { uk: "АПЕЛЬСИН", en: "ORANGE" },
  "МАСЛО": { uk: "МАСЛО", en: "BUTTER" },
  "САХАР": { uk: "ЦУКОР", en: "SUGAR" },
  "СОЛЬ": { uk: "СІЛЬ", en: "SALT" },
  "СЫР": { uk: "СИР", en: "CHEESE" },
  "ЧАЙ": { uk: "ЧАЙ", en: "TEA" },
  "ЯГОДА": { uk: "ЯГОДА", en: "BERRY" },
  "ЯЙЦО": { uk: "ЯЙЦЕ", en: "EGG" },

  // Transport
  "МАШИНА": { uk: "МАШИНА", en: "CAR" },
  "САМОЛЕТ": { uk: "ЛІТАК", en: "AIRPLANE" },
  "ПОЕЗД": { uk: "ПОТЯГ", en: "TRAIN" },
  "АВТОБУС": { uk: "АВТОБУС", en: "BUS" },
  "ВЕЛОСИПЕД": { uk: "ВЕЛОСИПЕД", en: "BICYCLE" },
  "КОРАБЛЬ": { uk: "КОРАБЕЛЬ", en: "SHIP" },
  "ВЕРТОЛЕТ": { uk: "ГЕЛІКОПТЕР", en: "HELICOPTER" },
  "КАТЕР": { uk: "КАТЕР", en: "BOAT" },
  "МЕТРО": { uk: "МЕТРО", en: "METRO" },
  "МОТОЦИКЛ": { uk: "МОТОЦИКЛ", en: "MOTORCYCLE" },
  "ТАКСИ": { uk: "ТАКСІ", en: "TAXI" },
  "ТРАМВАЙ": { uk: "ТРАМВАЙ", en: "TRAM" },
  "ТРОЛЛЕЙБУС": { uk: "ТРОЛЕЙБУС", en: "TROLLEYBUS" },
  "ЭЛЕКТРИЧКА": { uk: "ЕЛЕКТРИЧКА", en: "COMMUTER TRAIN" },
  "САМОКАТ": { uk: "САМОКАТ", en: "SCOOTER" },

  // Family
  "МАМА": { uk: "МАМА", en: "MOTHER" },
  "ПАПА": { uk: "ТАТО", en: "FATHER" },
  "ДЯДЯ": { uk: "ДЯДЬКО", en: "UNCLE" },
  "ТЁТЯ": { uk: "ТІТКА", en: "AUNT" },
  "БРАТ": { uk: "БРАТ", en: "BROTHER" },
  "СЕСТРА": { uk: "СЕСТРА", en: "SISTER" },
  "ДЕДУШКА": { uk: "ДІДУСЬ", en: "GRANDFATHER" },
  "БАБУШКА": { uk: "БАБУСЯ", en: "GRANDMOTHER" },
  "ДЕТИ": { uk: "ДІТИ", en: "CHILDREN" },
  "ДОЧЬ": { uk: "ДОНЬКА", en: "DAUGHTER" },
  "СЫН": { uk: "СИН", en: "SON" },
  "МУЖ": { uk: "ЧОЛОВІК", en: "HUSBAND" },
  "ЖЕНА": { uk: "ДРУЖИНА", en: "WIFE" },
  "РОДИТЕЛИ": { uk: "БАТЬКИ", en: "PARENTS" },
  "СЕМЬЯ": { uk: "СІМ'Я", en: "FAMILY" },
  "МАЛЬЧИК": { uk: "ХЛОПЧИК", en: "BOY" },
  "ДЕВОЧКА": { uk: "ДІВЧИНКА", en: "GIRL" },

  // Seasons and time
  "ЛЕТО": { uk: "ЛІТО", en: "SUMMER" },
  "ЗИМА": { uk: "ЗИМА", en: "WINTER" },
  "ВЕСНА": { uk: "ВЕСНА", en: "SPRING" },
  "ОСЕНЬ": { uk: "ОСІНЬ", en: "AUTUMN" },
  "УТРО": { uk: "РАНОК", en: "MORNING" },
  "ДЕНЬ": { uk: "ДЕНЬ", en: "DAY" },
  "ВЕЧЕР": { uk: "ВЕЧІР", en: "EVENING" },
  "НОЧЬ": { uk: "НІЧ", en: "NIGHT" },
  "ЖАРА": { uk: "СПЕКА", en: "HEAT" },
  "ТЕПЛО": { uk: "ТЕПЛО", en: "WARMTH" },
  "ХОЛОД": { uk: "ХОЛОД", en: "COLD" },
  "МОРОЗ": { uk: "МОРОЗ", en: "FROST" },

  // Places
  "ШКОЛА": { uk: "ШКОЛА", en: "SCHOOL" },
  "ПАРК": { uk: "ПАРК", en: "PARK" },
  "МАГАЗИН": { uk: "МАГАЗИН", en: "STORE" },
  "БОЛЬНИЦА": { uk: "ЛІКАРНЯ", en: "HOSPITAL" },
  "ТЕАТР": { uk: "ТЕАТР", en: "THEATER" },
  "МУЗЕЙ": { uk: "МУЗЕЙ", en: "MUSEUM" },
  "РЫНОК": { uk: "РИНОК", en: "MARKET" },
  "АЭРОПОРТ": { uk: "АЕРОПОРТ", en: "AIRPORT" },
  "БИБЛИОТЕКА": { uk: "БІБЛІОТЕКА", en: "LIBRARY" },
  "КИНО": { uk: "КІНО", en: "CINEMA" },
  "ПЛОЩАДЬ": { uk: "ПЛОЩА", en: "SQUARE" },
  "ПОЧТА": { uk: "ПОШТА", en: "POST OFFICE" },
  "РЕСТОРАН": { uk: "РЕСТОРАН", en: "RESTAURANT" },
  "СТАДИОН": { uk: "СТАДІОН", en: "STADIUM" },
  "ПОЖАРНАЯ": { uk: "ПОЖЕЖНА", en: "FIRE STATION" },
  "ПОЛИЦИЯ": { uk: "ПОЛІЦІЯ", en: "POLICE" },
  "СКОРАЯ": { uk: "ШВИДКА", en: "AMBULANCE" },

  // Other
  "СПА": { uk: "СПА", en: "SPA" },
  "КОЛОБОК": { uk: "КОЛОБОК", en: "KOLOBOK" },
  "ЯЗЫК": { uk: "МОВА", en: "LANGUAGE" },
  "ЯМА": { uk: "ЯМА", en: "PIT" },
  "ЯМКА": { uk: "ЯМКА", en: "HOLE" },
  "ЯКОРЬ": { uk: "ЯКІР", en: "ANCHOR" },
  "ЯЛТА": { uk: "ЯЛТА", en: "YALTA" },
};

async function migrateTranslations() {
  console.log("Starting translation migration...");

  // Get all words from database
  const allWords = await db.select().from(words);
  console.log(`Found ${allWords.length} words in database`);

  let inserted = 0;
  let skipped = 0;

  for (const word of allWords) {
    const translations = TRANSLATIONS[word.word];

    if (!translations) {
      console.log(`⚠️ No translation found for: ${word.word}`);
      skipped++;
      continue;
    }

    // Insert Ukrainian translation
    try {
      await db.insert(wordTranslations).values({
        wordId: word.id,
        language: "uk",
        translation: translations.uk,
      }).onConflictDoNothing();
      inserted++;
    } catch (error) {
      console.log(`Ukrainian translation for ${word.word} already exists`);
    }

    // Insert English translation
    try {
      await db.insert(wordTranslations).values({
        wordId: word.id,
        language: "en",
        translation: translations.en,
      }).onConflictDoNothing();
      inserted++;
    } catch (error) {
      console.log(`English translation for ${word.word} already exists`);
    }
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Inserted: ${inserted} translations`);
  console.log(`   Skipped: ${skipped} words (no translation)`);
}

migrateTranslations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
