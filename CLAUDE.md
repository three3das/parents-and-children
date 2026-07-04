# Knowledge Children - Claude Development Guidelines

## Database and Constants Synchronization Rules

### Emoji Management
- **Rule**: Database and constants must always be in sync
- **Implementation**: Words in the database should only reference image keys that exist in `PICTURE_EMOJIS` constants
- **Action when emoji is not suitable**: If an emoji doesn't properly represent the word concept, remove both:
  1. The emoji entry from `client/src/lib/constants.ts` 
  2. The corresponding word(s) from the database
- **Fallback**: Words without emoji mappings will display ❓ as fallback

### Development Server
- **Port**: Use port 5001 for development (configurable via PORT env var)
- **Command**: `npm run dev`
- **Database**: Requires Supabase connection string in DATABASE_URL
- **Environment**: Requires `.env` file with:
  - `DATABASE_URL` - Supabase connection string
  - `PORT` - Server port (default: 5001)
  - `APP_URL` - Application URL for callbacks (e.g., http://localhost:5001)
  - `NOWPAYMENTS_API_KEY` - NOWPayments API key
  - `NOWPAYMENTS_PUBLIC_KEY` - NOWPayments public key
  - `NOWPAYMENTS_IPN_SECRET` - NOWPayments IPN secret for webhook verification

### Production Deployment (Render)

#### Deployment URL
- **Production**: https://knowledge-children.onrender.com/

#### Deployment Process
- Push to GitHub main branch
- Render automatically builds and deploys
- Environment variables must be set in Render dashboard

#### Build Configuration
- **Build**: `npm run build` - builds client and server
- **Start**: `npm run start` - runs production server
- **Database**: Uses DATABASE_URL from environment
- **Node.js engine**: >=20.0.0

### UI Design Principles
- **Target Audience**: Children learning to read
- **Text Usage**: Avoid text where possible - children cannot read yet
- **Visual Communication**: Use emojis and visual elements for navigation
- **Exceptions**: Keep essential text like "Knowledge Children" and "Настройки" (Settings)

### Test User Credentials
- **Email**: test@knowledgechildren.com
- **Password**: Test1234

### Subscription System
- **Payment Provider**: NOWPayments (crypto payments)
- **Plans**: Lifetime access plan
- **Tables**: 
  - `subscriptions` - user subscription records
  - `crypto_payments` - payment transactions
  - `webhook_logs` - NOWPayments webhook events
- **Important**: `dotenv.config()` must be called in `nowpayments.ts` before accessing env vars

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