import type { Product } from '@/types/product'
import { categories } from './categories'

/**
 * Breadline menu sourced from Foodpanda listing (Karachi).
 * Prices: current Foodpanda price + compareAtPrice where a deal applies.
 * Images: local stock photos under /images/products (not scraped from Foodpanda).
 * @see https://www.foodpanda.pk/restaurant/y28p/breadline
 */

const burgerMods = [
  'extra-cheese',
  'extra-patty',
  'mayo',
  'garlic-mayo',
  'spicy-sauce',
  'ketchup'
]

const sauceMods = ['spicy-sauce', 'garlic-mayo', 'ketchup']
const friesMods = ['extra-cheese', 'mayo', 'garlic-mayo', 'ketchup']
const sandwichMods = ['extra-cheese', 'mayo', 'ketchup']

const img = {
  zinger: '/images/products/zinger-burger.png',
  zingerCheese: '/images/products/zinger-burger-cheese.png',
  crispy: '/images/products/crispy-chicken-burger.png',
  crispyCheese: '/images/products/crispy-chicken-burger-cheese.png',
  special: '/images/products/special-zinger.png',
  chickenBurger: '/images/products/chicken-burger.png',
  cheeseBurstLeg: '/images/products/cheese-burst-leg.png',
  cheeseBurstBreast: '/images/products/cheese-burst-breast.png',
  broastLeg: '/images/products/broast-leg.png',
  broastBreast: '/images/products/broast-breast.png',
  club: '/images/products/club-sandwich.png',
  beefSandwich: '/images/products/beef-sandwich.png',
  chickenSandwich: '/images/products/chicken-sandwich.png',
  potatoSandwich: '/images/products/potato-sandwich.png',
  gyro: '/images/products/gyro-wrap.png',
  twister: '/images/products/twister-wrap.png',
  zingerWrap: '/images/products/zinger-wrap.png',
  fries: '/images/products/plain-fries.png',
  garlicFries: '/images/products/mayo-garlic-fries.png',
  loadedFries: '/images/products/loaded-fries.png',
  pizzaFries: '/images/products/pizza-fries.png',
  wings: '/images/products/wings.png',
  strips: '/images/products/chicken-strips.png'
}

export const products: Product[] = [
  // —— Burgers ——
  {
    id: 'p1',
    slug: 'zinger-burger',
    name: 'Zinger Burger',
    description:
      'Crispy golden fried chicken patty layered with fresh lettuce, tomato and creamy mayo on a soft toasted bun. A savory delight that satisfies every craving.',
    price: 280.5,
    compareAtPrice: 330,
    categoryId: 'burgers',
    image: img.zinger,
    bestSeller: true,
    modifiers: burgerMods
  },
  {
    id: 'p2',
    slug: 'zinger-burger-with-cheese',
    name: 'Zinger Burger with Cheese',
    description:
      'Crispy golden fried chicken patty topped with melted cheese, lettuce, tomato and special sauce served on a soft toasted bun.',
    price: 323,
    compareAtPrice: 380,
    categoryId: 'burgers',
    image: img.zingerCheese,
    bestSeller: true,
    modifiers: burgerMods
  },
  {
    id: 'p3',
    slug: 'crispy-chicken-burger',
    name: 'Crispy Chicken Burger',
    description:
      'Tender juicy chicken breast seasoned to perfection and fried until golden crispy. Served on a soft toasted bun with fresh lettuce, tomato and our signature sauce.',
    price: 280.5,
    compareAtPrice: 330,
    categoryId: 'burgers',
    image: img.crispy,
    bestSeller: true,
    modifiers: burgerMods
  },
  {
    id: 'p4',
    slug: 'crispy-chicken-burger-with-cheese',
    name: 'Crispy Chicken Burger with Cheese',
    description:
      'Juicy crispy chicken patty topped with melted cheese, lettuce, tomato and special sauce served on a soft toasted bun.',
    price: 323,
    compareAtPrice: 380,
    categoryId: 'burgers',
    image: img.crispyCheese,
    modifiers: burgerMods
  },

  // —— Premium Menu ——
  {
    id: 'p5',
    slug: 'breadline-special-zinger',
    name: 'Breadline Special Zinger',
    description:
      'Crispy golden zinger fillet seasoned with aromatic spices and served on fresh bread with lettuce, tomato and our signature special sauce for an unforgettable taste.',
    price: 467.5,
    compareAtPrice: 550,
    categoryId: 'premium',
    image: img.special,
    bestSeller: true,
    modifiers: burgerMods
  },
  {
    id: 'p6',
    slug: 'breadline-chicken-burger',
    name: 'Breadline Chicken Burger',
    description:
      'Succulent grilled chicken breast served on toasted bread with fresh lettuce, tomato and our signature sauce. A premium choice that delivers tender juicy flavors in every bite.',
    price: 467.5,
    compareAtPrice: 550,
    categoryId: 'premium',
    image: img.chickenBurger,
    bestSeller: true,
    modifiers: burgerMods
  },
  {
    id: 'p7',
    slug: 'breadline-cheese-burst-leg-piece',
    name: 'Breadline Cheese Burst Leg Piece',
    description:
      'Juicy chicken leg piece bursting with melted cheese inside crispy golden coating, seasoned to perfection.',
    price: 493,
    compareAtPrice: 580,
    categoryId: 'premium',
    image: img.cheeseBurstLeg,
    modifiers: sauceMods
  },
  {
    id: 'p8',
    slug: 'breadline-cheese-burst-breast-piece',
    name: 'Breadline Cheese Burst Breast Piece',
    description:
      'Tender chicken breast piece filled with melted cheese that bursts with flavor when bitten into. Perfectly seasoned and breaded to golden perfection for a delightful premium experience.',
    price: 578,
    compareAtPrice: 680,
    categoryId: 'premium',
    image: img.cheeseBurstBreast,
    modifiers: sauceMods
  },
  {
    id: 'p9',
    slug: 'breadline-plain-broast-leg-piece',
    name: 'Breadline Plain Broast Leg Piece',
    description:
      'Tender broast leg piece seasoned to perfection and deep fried until golden crispy outside while remaining juicy inside. A premium choice from our signature broast collection.',
    price: 493,
    compareAtPrice: 580,
    categoryId: 'premium',
    image: img.broastLeg,
    modifiers: sauceMods
  },
  {
    id: 'p10',
    slug: 'breadline-plain-broast-breast-piece',
    name: 'Breadline Plain Broast Breast Piece',
    description:
      'Tender and juicy broast chicken breast piece seasoned to perfection with our signature blend of spices. Crispy golden exterior with succulent meat inside, served fresh and hot from our kitchen.',
    price: 552.5,
    compareAtPrice: 650,
    categoryId: 'premium',
    image: img.broastBreast,
    modifiers: sauceMods
  },
  {
    id: 'p11',
    slug: 'breadline-club-sandwich',
    name: 'Breadline Club Sandwich',
    description:
      'A classic triple-decker sandwich layered with crispy toasted bread, succulent grilled chicken, tender turkey slices, fresh lettuce, ripe tomatoes and creamy mayo. Perfectly cut and served with a side of fries for the ultimate club sandwich experience.',
    price: 467.5,
    compareAtPrice: 550,
    categoryId: 'premium',
    image: img.club,
    modifiers: sandwichMods
  },

  // —— Sandwiches ——
  {
    id: 'p12',
    slug: 'toasted-beef-sandwich',
    name: 'Toasted Beef Sandwich',
    description:
      'Tender sliced beef grilled to perfection and served on toasted bread with fresh lettuce, tomato and our signature sauce for a satisfying meal.',
    price: 280.5,
    compareAtPrice: 330,
    categoryId: 'sandwiches',
    image: img.beefSandwich,
    modifiers: sandwichMods
  },
  {
    id: 'p13',
    slug: 'toasted-chicken-sandwich',
    name: 'Toasted Chicken Sandwich',
    description:
      'Tender grilled chicken breast served on toasted bread with fresh lettuce, tomato and creamy mayo. A satisfying sandwich perfect for any meal.',
    price: 255,
    compareAtPrice: 300,
    categoryId: 'sandwiches',
    image: img.chickenSandwich,
    modifiers: sandwichMods
  },
  {
    id: 'p14',
    slug: 'potato-sandwich-with-egg',
    name: 'Potato Sandwich with Egg',
    description:
      'Soft buttered bread filled with creamy mashed potatoes and fluffy scrambled eggs seasoned with fresh spices and herbs. A satisfying and wholesome sandwich perfect for any time of day.',
    price: 255,
    compareAtPrice: 300,
    categoryId: 'sandwiches',
    image: img.potatoSandwich,
    modifiers: sandwichMods
  },

  // —— Wraps ——
  {
    id: 'p15',
    slug: 'gyro-wrap',
    name: 'Gyro Wrap',
    description:
      'Tender seasoned meat carved fresh from the rotisserie combined with crisp lettuce, tomatoes, onions and creamy tzatziki sauce wrapped in warm soft pita bread.',
    price: 280.5,
    compareAtPrice: 330,
    categoryId: 'wraps',
    image: img.gyro,
    modifiers: sauceMods
  },
  {
    id: 'p16',
    slug: 'twister-wrap',
    name: 'Twister Wrap',
    description:
      'A delicious wrap filled with tender grilled chicken, fresh vegetables, and savory sauce all wrapped in a soft tortilla. Perfect for a quick and satisfying meal on the go.',
    price: 280.5,
    compareAtPrice: 330,
    categoryId: 'wraps',
    image: img.twister,
    modifiers: sauceMods
  },
  {
    id: 'p17',
    slug: 'zinger-wrap',
    name: 'Zinger Wrap',
    description:
      'Crispy golden fried chicken fillet wrapped in soft tortilla with fresh lettuce, tomato and creamy mayo sauce for a delicious handheld meal.',
    price: 280.5,
    compareAtPrice: 330,
    categoryId: 'wraps',
    image: img.zingerWrap,
    bestSeller: true,
    modifiers: burgerMods
  },

  // —— Fries ——
  {
    id: 'p18',
    slug: 'plain-fries',
    name: 'Plain Fries',
    description:
      'Golden crispy fries seasoned with sea salt and served piping hot. A perfect side dish or snack on its own.',
    price: 153,
    compareAtPrice: 180,
    categoryId: 'fries',
    image: img.fries,
    modifiers: friesMods
  },
  {
    id: 'p19',
    slug: 'mayo-garlic-fries',
    name: 'Mayo Garlic Fries',
    description:
      'Crispy golden fries tossed with creamy mayo and roasted garlic, delivering a perfect blend of savory and tangy flavors in every bite.',
    price: 195.5,
    compareAtPrice: 230,
    categoryId: 'fries',
    image: img.garlicFries,
    modifiers: friesMods
  },
  {
    id: 'p20',
    slug: 'loaded-fries',
    name: 'Loaded Fries',
    description:
      'Golden crispy fries generously loaded with melted cheese, savory toppings, and fresh garnishes for a satisfying and indulgent treat.',
    price: 340,
    compareAtPrice: 400,
    categoryId: 'fries',
    image: img.loadedFries,
    bestSeller: true,
    modifiers: friesMods
  },
  {
    id: 'p21',
    slug: 'pizza-fries',
    name: 'Pizza Fries',
    description:
      'Golden fries smothered in a rich tomato sauce, melted cheese & classic pizza toppings.',
    price: 340,
    compareAtPrice: 400,
    categoryId: 'fries',
    image: img.pizzaFries,
    modifiers: friesMods
  },

  // —— Add Ons ——
  {
    id: 'p22',
    slug: 'wings',
    name: 'Wings',
    description:
      'Tender chicken wings seasoned with aromatic spices and grilled to golden perfection. Crispy on the outside and juicy inside — an ideal addition to any meal.',
    price: 400,
    categoryId: 'addons',
    image: img.wings,
    modifiers: sauceMods
  },
  {
    id: 'p23',
    slug: 'chicken-strips',
    name: 'Chicken Strips',
    description:
      'Tender golden chicken strips seasoned with aromatic spices and fried to crispy perfection. A delicious add-on that pairs perfectly with any main course or enjoyed on its own.',
    price: 400,
    categoryId: 'addons',
    image: img.strips,
    modifiers: sauceMods
  }
]

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(categoryId: string) {
  return products.filter((p) => p.categoryId === categoryId)
}

export function getBestSellers() {
  return products.filter((p) => p.bestSeller)
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      categories.find((c) => c.id === p.categoryId)?.name.toLowerCase().includes(q)
  )
}
