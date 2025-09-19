# Pokemon Card Collection Manager

A modern, responsive React application for managing your Pokemon trading card collection with separate sections for ungraded singles, graded cards, and sealed products.

## Features

- 🃏 **Card Categories**: Organize cards into ungraded singles, graded cards, and sealed products
- 💎 **Graded Card Support**: Full support for PSA, BGS, CGC and other grading companies with subgrades
- 📦 **Sealed Product Tracking**: Track booster boxes, packs, theme decks, and other sealed items
- 🔍 **Advanced Search**: Search by card name, set, or card number with set filtering
- 💰 **Collection Value**: Real-time calculation of your collection's total value
- ✏️ **Inline Editing**: Edit card details directly from the card view
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 💾 **Persistent Storage**: Automatic saving to browser's local storage
- 📊 **Category Statistics**: View count and value for each category
- 🎨 **Authentic Styling**: Pokemon-themed design with rarity-specific colors

## Card Categories

### 🃏 Ungraded Singles
- Raw Pokemon cards in various conditions
- Condition tracking (Mint, Near Mint, Light Play, etc.)
- Price tracking and purchase history
- Set and card number organization

### 💎 Graded Cards  
- Professional grading company support (PSA, BGS, CGC, etc.)
- Certification number tracking
- BGS subgrade support (Centering, Corners, Edges, Surface)
- Population and grade rarity information

### 📦 Sealed Products
- Booster boxes, packs, theme decks
- Elite trainer boxes, tins, collection boxes
- Factory seal condition tracking
- Investment tracking for sealed products

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository or download the project files
2. Navigate to the project directory:
   ```bash
   cd "Pokemon Inventory Website"
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and visit `http://localhost:3000`

## Usage

### Viewing Your Collection
- Cards are displayed in a responsive grid layout organized by category
- Use the category tabs to filter between ungraded, graded, and sealed products
- Each card shows detailed information including condition, price, and purchase details
- Graded cards display certification numbers and subgrades when applicable

### Adding New Cards
1. Click the "Add Card" button
2. Select the appropriate category (Ungraded, Graded, or Sealed)
3. Fill out the form with card details
4. For graded cards, specify the grading company and certification number
5. For BGS graded cards, optionally add subgrades
6. For sealed products, select the specific product type

### Searching and Filtering
- Use the search bar to find cards by name, set, or card number
- Filter by specific Pokemon sets using the dropdown
- Combine search terms with set filters for precise results
- Use category tabs to focus on specific types of products

### Editing Cards
1. Click the "Edit" button on any card
2. Modify details inline
3. Click "Save" to confirm changes or "Cancel" to discard

### Collection Statistics
- View total collection value across all categories
- See individual category counts and values
- Track your collection growth over time

## Data Structure

Each card in your collection includes:

**Basic Information:**
- Card name, set, and card number
- Rarity and condition
- Purchase date and location
- Current market price

**Category-Specific Data:**
- **Ungraded**: Raw condition assessment
- **Graded**: Grading company, grade, certification number, subgrades
- **Sealed**: Product type, seal condition, authenticity notes

**Additional Details:**
- High-resolution card images
- Personal notes and observations
- Purchase history and provenance

## Sample Data

The application includes sample cards to demonstrate features:
- Base Set Charizard (Ungraded, Near Mint)
- PSA 9 Base Set Pikachu (Graded)
- BGS 9.5 Fossil Dragonite with subgrades (Graded)
- Base Set Booster Box (Sealed)
- Team Rocket Booster Pack (Sealed)

## Technologies Used

- **React 18**: Modern React with hooks and functional components
- **CSS3**: Advanced styling with gradients, backdrop filters, and animations
- **Local Storage API**: For persistent data storage
- **Pokemon TCG Images**: High-quality card images from official sources

## Card Sets Supported

The application includes comprehensive set data from:
- Classic sets (Base Set, Jungle, Fossil, Team Rocket)
- Neo series (Genesis, Discovery, Revelation, Destiny)
- e-Card series (Expedition, Aquapolis, Skyridge)
- EX series (Ruby & Sapphire through Power Keepers)
- Diamond & Pearl era
- HeartGold & SoulSilver era
- Black & White era
- XY era
- Sun & Moon era
- Sword & Shield era
- Scarlet & Violet era (current)

## Grading Companies

Full support for major grading companies:
- **PSA** (Professional Sports Authenticator)
- **BGS** (Beckett Grading Services) with subgrade support
- **CGC** (Certified Guaranty Company)
- **SGC** (Sportscard Guaranty)
- **HGA** (Hybrid Grading Approach)
- **GMA** (Grading, Authentication & Preservation Services)
- **TAG** (The Authentication Group)

## Browser Compatibility

This application works in all modern browsers that support:
- CSS Grid and Flexbox
- CSS backdrop-filter
- ES6+ JavaScript features
- Local Storage API

## Contributing

Feel free to fork this project and submit pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License.