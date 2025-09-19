export const sampleCardData = [
  // Ungraded Singles
  {
    id: 1,
    name: "Charizard",
    set: "Base Set",
    cardNumber: "4/102",
    rarity: "Holo Rare",
    condition: "Near Mint",
    price: 450.00,
    purchaseDate: "2024-01-15",
    purchaseLocation: "eBay",
    category: "ungraded",
    type: "single",
    image: "https://images.pokemontcg.io/base1/4_hires.png",
    notes: "Excellent centering, minor whitening on back edges"
  },
  {
    id: 2,
    name: "Blastoise",
    set: "Base Set",
    cardNumber: "2/102",
    rarity: "Holo Rare",
    condition: "Light Play",
    price: 280.00,
    purchaseDate: "2024-01-10",
    purchaseLocation: "Local Card Shop",
    category: "ungraded",
    type: "single",
    image: "https://images.pokemontcg.io/base1/2_hires.png",
    notes: "Some edge wear, holo still vibrant"
  },
  {
    id: 3,
    name: "Venusaur",
    set: "Base Set",
    cardNumber: "15/102",
    rarity: "Holo Rare",
    condition: "Mint",
    price: 320.00,
    purchaseDate: "2024-01-05",
    purchaseLocation: "TCGPlayer",
    category: "ungraded",
    type: "single",
    image: "https://images.pokemontcg.io/base1/15_hires.png",
    notes: "Perfect condition, potential PSA 10"
  },
  // Graded Cards
  {
    id: 4,
    name: "Pikachu",
    set: "Base Set",
    cardNumber: "58/102",
    rarity: "Common",
    condition: "PSA 9",
    gradingCompany: "PSA",
    certificationNumber: "12345678",
    price: 180.00,
    purchaseDate: "2023-12-20",
    purchaseLocation: "Heritage Auctions",
    category: "graded",
    type: "single",
    image: "https://images.pokemontcg.io/base1/58_hires.png",
    notes: "Pop 1 of 500, very rare in this grade"
  },
  {
    id: 5,
    name: "Dragonite",
    set: "Fossil",
    cardNumber: "19/62",
    rarity: "Holo Rare",
    condition: "BGS 9.5",
    gradingCompany: "BGS",
    certificationNumber: "87654321",
    subgrades: {
      centering: 9.5,
      corners: 9.5,
      edges: 9.5,
      surface: 9
    },
    price: 650.00,
    purchaseDate: "2024-02-01",
    purchaseLocation: "PWCC Marketplace",
    category: "graded",
    type: "single",
    image: "https://images.pokemontcg.io/fossil/19_hires.png",
    notes: "Gem mint, black label candidate"
  },
  // Sealed Products
  {
    id: 6,
    name: "Base Set Booster Box",
    set: "Base Set",
    condition: "Factory Sealed",
    price: 8500.00,
    purchaseDate: "2024-01-25",
    purchaseLocation: "Private Collector",
    category: "sealed",
    type: "booster_box",
    image: "https://images.pokemontcg.io/base1/logo.png",
    notes: "Authenticated, perfect shrink wrap"
  },
  {
    id: 7,
    name: "Team Rocket Booster Pack",
    set: "Team Rocket",
    condition: "Factory Sealed",
    price: 125.00,
    purchaseDate: "2024-02-10",
    purchaseLocation: "Card Convention",
    category: "sealed",
    type: "booster_pack",
    image: "https://images.pokemontcg.io/base5/logo.png",
    notes: "Heavy pack, potential holo inside"
  },
  {
    id: 8,
    name: "Jungle Theme Deck - Water Blast",
    set: "Jungle",
    condition: "Factory Sealed",
    price: 450.00,
    purchaseDate: "2024-01-30",
    purchaseLocation: "Online Auction",
    category: "sealed",
    type: "theme_deck",
    image: "https://images.pokemontcg.io/base2/logo.png",
    notes: "Rare sealed theme deck, excellent condition"
  }
];

export const cardSets = [
  "Base Set", "Base Set 2", "Jungle", "Fossil", "Team Rocket",
  "Gym Heroes", "Gym Challenge", "Neo Genesis", "Neo Discovery",
  "Neo Destiny", "Neo Revelation", "Legendary Collection", "Expedition",
  "Aquapolis", "Skyridge", "Ruby & Sapphire", "Sandstorm", "Dragon",
  "Team Magma vs Team Aqua", "Hidden Legends", "FireRed & LeafGreen",
  "Team Rocket Returns", "Deoxys", "Emerald", "Unseen Forces",
  "Delta Species", "Legend Maker", "Holon Phantoms", "Crystal Guardians",
  "Dragon Frontiers", "Power Keepers", "Diamond & Pearl", "Mysterious Treasures",
  "Secret Wonders", "Great Encounters", "Majestic Dawn", "Legends Awakened",
  "Stormfront", "Platinum", "Rising Rivals", "Supreme Victors",
  "Arceus", "HeartGold & SoulSilver", "Unleashed", "Undaunted",
  "Triumphant", "Call of Legends", "Black & White", "Emerging Powers",
  "Noble Victories", "Next Destinies", "Dark Explorers", "Dragons Exalted",
  "Boundaries Crossed", "Plasma Storm", "Plasma Freeze", "Plasma Blast",
  "Legendary Treasures", "XY", "Flashfire", "Furious Fists",
  "Phantom Forces", "Primal Clash", "Roaring Skies", "Ancient Origins",
  "BREAKthrough", "BREAKpoint", "Generations", "Fates Collide",
  "Steam Siege", "Evolutions", "Sun & Moon", "Guardians Rising",
  "Burning Shadows", "Shining Legends", "Crimson Invasion",
  "Ultra Prism", "Forbidden Light", "Celestial Storm", "Dragon Majesty",
  "Lost Thunder", "Team Up", "Detective Pikachu", "Unbroken Bonds",
  "Unified Minds", "Hidden Fates", "Cosmic Eclipse", "Sword & Shield",
  "Rebel Clash", "Darkness Ablaze", "Champion's Path", "Vivid Voltage",
  "Shining Fates", "Battle Styles", "Chilling Reign", "Evolving Skies",
  "Celebrations", "Fusion Strike", "Brilliant Stars", "Astral Radiance",
  "Pokemon GO", "Lost Origin", "Silver Tempest", "Crown Zenith",
  "Scarlet & Violet", "Paldea Evolved", "Obsidian Flames", "151",
  "Paradox Rift", "Paldean Fates"
];

export const cardRarities = [
  "Common", "Uncommon", "Rare", "Rare Holo", "Ultra Rare",
  "Secret Rare", "Rainbow Rare", "Gold Rare", "Full Art",
  "Alternate Art", "Special Illustration Rare", "Hyper Rare",
  "Radiant Rare", "Amazing Rare", "Promo", "Error Card"
];

export const cardConditions = [
  "Mint", "Near Mint", "Excellent", "Very Good", "Good",
  "Light Play", "Played", "Poor", "Damaged"
];

export const gradingCompanies = [
  "PSA", "BGS", "CGC", "SGC", "HGA", "GMA", "TAG"
];

export const sealedTypes = [
  "booster_pack", "booster_box", "theme_deck", "starter_deck",
  "elite_trainer_box", "collection_box", "tin", "blister_pack",
  "bundle", "premium_collection", "ultra_premium_collection"
];

export const categories = [
  { id: "ungraded", name: "Ungraded Singles", icon: "🃏" },
  { id: "graded", name: "Graded Cards", icon: "💎" },
  { id: "sealed", name: "Sealed Products", icon: "📦" }
];

export const allCategories = [
  { id: "ungraded", name: "Ungraded Singles", icon: "🃏" },
  { id: "graded", name: "Graded Cards", icon: "💎" },
  { id: "sealed", name: "Sealed Products", icon: "📦" },
  { id: "sold", name: "Sales History", icon: "💰" }
];
