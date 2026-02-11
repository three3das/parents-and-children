# KidRead - Claude Development Guidelines

## Database and Constants Synchronization Rules

### Emoji Management
- **Rule**: Database and constants must always be in sync
- **Implementation**: Words in the database should only reference image keys that exist in `PICTURE_EMOJIS` constants
- **Action when emoji is not suitable**: If an emoji doesn't properly represent the word concept, remove both:
  1. The emoji entry from `client/src/lib/constants.ts` 
  2. The corresponding word(s) from the database
- **Fallback**: Words without emoji mappings will display ❓ as fallback

### Development Server
- **Port**: Use port 3456 for development
- **Command**: `DATABASE_URL="..." PORT=3456 npm run dev`
- **Database**: Requires Supabase connection string in DATABASE_URL

### Production Build & Heroku Deployment

#### Deployment Process
1. **Full deployment with checks**: `npm run deploy`
   - Runs TypeScript type checking
   - Tests local build
   - Commits any changes
   - Pushes to GitHub (origin/main)
   - Deploys to Heroku
   
2. **Quick deployment**: `npm run deploy:quick`
   - Commits all changes with "Quick deploy" message
   - Pushes directly to Heroku

#### Build Configuration
- **Build**: `npm run build` - builds client and server locally (for testing)
- **Start**: `npm run start` - runs production server
- **Database**: Hardcoded Supabase URL with fallback to DATABASE_URL env var

#### Heroku Requirements
- **Procfile**: `web: npm run start`
- **Node.js engine**: >=20.0.0
- **Dynamic vite imports**: Production compatibility (vite only loaded in dev)
- **SSL configuration**: Automatic for Supabase connections
- **Auto-build**: Heroku automatically runs `npm run build` during deployment

### UI Design Principles
- **Target Audience**: Children learning to read
- **Text Usage**: Avoid text where possible - children cannot read yet
- **Visual Communication**: Use emojis and visual elements for navigation
- **Exceptions**: Keep essential text like "KidRead" and "Настройки" (Settings)

### Test User Credentials
- **Email**: test@kidread.com
- **Password**: Test1234

### Click-Based Game Interactions
- **Library**: No external drag-and-drop library needed
- **Components**:
  - `ClickableLetter`: Reusable letter button with optional speaker icon
  - `LetterSlot`: Slot for placed letters with click-to-remove
- **Games**:
  - SpellWordGame: Click letter to auto-place in next empty slot, click slot to remove
  - ExtraLetterGame: Click letter to attempt removal
  - MissingLetterGame: Click letter option to fill the slot

### Code Organization
- **Shared Constants**: All emoji mappings in `client/src/lib/constants.ts`
- **No Duplicates**: Remove duplicate PICTURE_EMOJIS from individual components
- **Import Pattern**: `import { PICTURE_EMOJIS } from "@/lib/constants"`

### Learning Blacklist System
- **Purpose**: Exclude words and letters that are too difficult for beginners
- **Word Blacklist**: Words with irregular spelling, silent letters, or complex pronunciation
  - Current: "солнце" (silent 'л' makes it difficult for beginners)
- **Letter Blacklist**: Rare letters with complex usage rules
  - Current: "ъ" (hard sign - rare and has complex grammatical rules)
- **Implementation**: 
  - Server-side filtering in `storage.ts` for word queries
  - Letter generation filtering in `routes.ts` for game options
- **Effect**: Blacklisted content never appears in games or letter options