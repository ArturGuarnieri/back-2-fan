
# Back2Fan Platform

An innovative cashback platform that combines purchases at partner stores with Fan Tokens and staking to maximize rewards. Users can earn cashback on their purchases and increase their rewards by staking Fan Tokens.

## 🌟 Key Features

### 💰 Cashback System
- Cashback on purchases at partner stores
- Variable cashback rates per category and store
- Bonus system based on staking levels (soon)
- Multi-currency support (USD, EUR, BRL, GBP, etc.)

### 🏆 Staking System with Tiers (soon)
- **Bronze** (100+ tokens): +1% cashback bonus
- **Silver** (500+ tokens): +2% cashback bonus  
- **Gold** (1000+ tokens): +3% cashback bonus

### 🎫 Fan Tokens
- Integration with football and sports team tokens
- Real-time prices via CoinGecko API
- Staking support for cashback bonuses (soon)
- Token portfolio visualization

### 🛍️ Partner Stores
- Catalog of partner stores
- Filters by country, category, and cashback rate
- Secure redirection for purchases
- Click and conversion tracking

### 🌍 Multilingual Support
- Portuguese, English, Spanish, French, German, Italian
- Country-based localization (BR, US, ES, etc.)
- Automatic local currencies

## 🚀 Technologies Used

### Frontend
- **React 18** with TypeScript
- **Vite** for development and build
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **React Router** for navigation
- **React Query** for state management
- **i18next** for internationalization

### Blockchain & Web3
- **Wagmi** for blockchain interaction
- **Reown AppKit** for wallet connection
- **Chiliz Chain** as main blockchain
- **Viem** for Ethereum utilities

### Backend & Database
- **Supabase** for backend and database
- **PostgreSQL** with Row Level Security
- **Edge Functions** for serverless logic
- **Real-time subscriptions** for live updates

### External APIs
- **CoinGecko API** for token prices
- **Affiliate Networks** (Awin, Rakuten) for tracking

## 🗄️ Database Architecture

The platform uses PostgreSQL through Supabase with the following table structure:

![Database Schema](database-schema.png)

### Core Tables

#### `wallet_users`
Stores user information and wallet connections:
- `id` (uuid): Unique user identifier
- `wallet_address` (text): User's blockchain wallet address
- `email` (text): User's email address
- `name` (text): Full name
- `first_name` (text): First name
- `last_name` (text): Last name
- `staked_tokens` (integer): Number of tokens currently staked
- `staking_level` (text): Current staking tier (bronze/silver/gold)
- `cashback_bonus` (integer): Bonus percentage from staking
- `default_currency` (text): User's preferred currency
- `created_at` (timestamp): Account creation date

#### `partners`
Partner stores and their configurations:
- `id` (uuid): Unique partner identifier
- `name` (text): Store name
- `logo` (text): Store logo URL or emoji
- `url` (text): Store website URL
- `base_rate` (integer): Base cashback percentage
- `category` (text): Store category (Fashion, Electronics, etc.)
- `featured` (boolean): Whether store is featured on homepage
- `color` (text): UI color theme for the store
- `country` (text[]): Array of supported countries
- `cashback_by_category` (jsonb): Category-specific cashback rates
- `awin_advertiser_id` (text): Awin network advertiser ID
- `rakuten_advertiser_id` (varchar): Rakuten network advertiser ID

#### `purchases`
User purchase history and cashback records:
- `id` (uuid): Unique purchase identifier
- `wallet_address` (text): Buyer's wallet address
- `partner_id` (uuid): Reference to partner store
- `purchase_value` (numeric): Total purchase amount
- `cashback_percent` (integer): Applied cashback percentage
- `cashback_amount` (numeric): Cashback amount earned
- `currency` (text): Transaction currency
- `date` (timestamp): Purchase date
- `status` (text): Transaction status (pending/confirmed/cancelled)

#### `fan_tokens`
Available Fan Tokens for staking:
- `id` (uuid): Unique token identifier
- `name` (text): Token full name
- `symbol` (text): Token symbol (e.g., PSG, BAR)
- `logo` (text): Token logo URL or emoji
- `category` (text): Token category (Football, eSports, etc.)
- `description` (text): Token description
- `chiliz_contract` (text): Smart contract address on Chiliz Chain
- `coingecko_id` (text): CoinGecko API identifier for price tracking
- `created_at` (timestamp): Token creation date

### Tracking Tables

#### `store_clicks`
Tracks user clicks on partner stores:
- `id` (uuid): Unique click identifier
- `wallet_address` (text): User's wallet address
- `partner_id` (uuid): Clicked partner store
- `clicked_at` (timestamp): Click timestamp

#### `affiliate_transactions`
Comprehensive affiliate transaction tracking:
- `id` (uuid): Unique transaction identifier
- `user_id` (uuid): Reference to wallet_users
- `wallet_address` (varchar): User's wallet address
- `partner_id` (uuid): Reference to partner store
- `transaction_id` (varchar): External transaction ID
- `order_id` (varchar): Order identifier
- `click_reference` (varchar): Click tracking reference
- `sale_amount` (numeric): Total sale amount
- `commission_amount` (numeric): Commission earned
- `cashback_percent` (numeric): Cashback percentage applied
- `cashback_amount` (numeric): Cashback amount
- `currency` (varchar): Transaction currency
- `affiliate_network` (varchar): Network used (awin/rakuten)
- `advertiser_id` (varchar): Advertiser identifier
- `status` (varchar): Transaction status
- `transaction_date` (timestamp): Transaction date
- `confirmation_date` (timestamp): Confirmation date
- `fan_token_id` (text): Associated fan token
- `nft_contract_address` (varchar): NFT contract address
- `nft_token_id` (varchar): NFT token ID
- `nft_metadata` (jsonb): NFT metadata
- `nft_mint_status` (varchar): NFT minting status
- `nft_transaction_hash` (varchar): Blockchain transaction hash
- `raw_data` (jsonb): Raw affiliate data
- `created_at` (timestamp): Record creation
- `updated_at` (timestamp): Last update

#### `postback_logs`
Logs from affiliate network webhooks:
- `id` (uuid): Unique log identifier
- `affiliate_network` (varchar): Network name
- `raw_payload` (jsonb): Complete webhook payload
- `processed` (boolean): Processing status
- `error_message` (text): Error details if any
- `transaction_id` (uuid): Associated transaction
- `created_at` (timestamp): Log creation time

### Access Control

#### `user_roles`
User role management system:
- `id` (uuid): Unique role identifier
- `wallet_address` (text): User's wallet address
- `role` (user_role): Role type (admin/user)
- `created_at` (timestamp): Role assignment date
- `created_by` (text): Who assigned the role

## 📁 Project Structure

```
src/
├── components/           # Reusable React components
│   ├── ui/              # Base shadcn/ui components
│   ├── admin/           # Administrative panel components
│   └── ...              # Other specific components
├── pages/               # Application pages
├── hooks/               # Custom React hooks
├── locales/             # Translation files
├── integrations/        # External service integrations
├── utils/               # Utility functions
└── types/               # TypeScript type definitions
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Reown AppKit project ID

### Installation

1. **Clone the repository**
```bash
git clone
cd
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configurations:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_REOWN_PROJECT_ID=your_reown_project_id
```

4. **Run development server**
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Database Setup

The Supabase migrations are located in `supabase/migrations/`. Run them in chronological order to set up the database schema.

Key features of our database setup:
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live updates
- **Custom functions** for complex queries
- **Triggers** for automatic data updates

## 🌐 Deployment

### Lovable (Recommended)
1. Connect your GitHub repository to Lovable
2. Configure environment variables in the panel
3. Automatic deployment on every push

### Vercel
1. Connect repository to Vercel
2. Configure environment variables
3. Automatic deployment

### Netlify
1. Drag `dist` folder after `npm run build`
2. Configure redirects for SPA
3. Set environment variables

## 🔧 Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Code linting
```

## 🏗️ Architecture

### Cashback Flow
1. User connects Web3 wallet
2. Browses partner stores
3. Clicks to visit store (tracked)
4. Makes purchase at store
5. System receives conversion webhook
6. Cashback is calculated and recorded
7. Staking bonus applied if applicable

### Tier System (soon)
- Users stake Fan Tokens
- Tiers calculated automatically
- Bonus applied to all future purchases

### Web3 Integration
- Multi-wallet support via Reown AppKit
- Chiliz Chain connection
- Token balance verification
- Secure staking transactions

## 🔐 Security

- **Row Level Security** in Supabase
- **Signature verification** for transactions
- **Rate limiting** on critical APIs
- **Data validation** in frontend and backend
- **Input sanitization** for user data

## 🧪 Testing

```bash
npm run test         # Run tests
npm run test:watch   # Watch mode tests
npm run test:coverage # Test coverage
```

## 📊 Monitoring

### Analytics
- Vercel Analytics integration
- Speed Insights for performance
- Affiliate conversion tracking

### Logs
- Structured logging in Supabase
- Webhook logs for debugging
- Error tracking

