// utils/valueCalculator.ts

import CategoryCardsList from '~/components/CategoryCardsList.vue'

type CatalogCard = { hero_id: number; value?: number }
type CatalogMethods = {
  generateSpecialCards: () => CatalogCard[]
  generateSSSCards: () => CatalogCard[]
  generateSSCards: () => CatalogCard[]
  generateSCards: () => CatalogCard[]
  generateACards: () => CatalogCard[]
}

// 卡片价格和分类以 CategoryCardsList.vue 为唯一数据源。
const catalogMethods = (CategoryCardsList as unknown as { methods: CatalogMethods }).methods
const cardCatalog = [
  { rarity: 'special', cards: catalogMethods.generateSpecialCards() },
  { rarity: 'sss', cards: catalogMethods.generateSSSCards() },
  { rarity: 'ss', cards: catalogMethods.generateSSCards() },
  { rarity: 's', cards: catalogMethods.generateSCards() },
  { rarity: 'a', cards: catalogMethods.generateACards() }
] as const
const cardById = new Map(cardCatalog.flatMap(group =>
  group.cards.map(card => [card.hero_id, { ...card, rarity: group.rarity }] as const)
))

// 定义稀有度倍数
export const cardAdvanceRates: Record<string, number> = {
  special: 2.2,
  sss: 1.6,
  ss: 1.5,
  s: 1,
  a: 0.6
}

// 3️⃣ 定义基础值
interface Card {
  hero_id: number
  advance_num?: number
}

interface Weapon {
  name?: string
  color?: string
  feature?: Array<[string]>
}

function getAdvanceMultiplier(card: Card): number {
  const advanceNum = card.advance_num || 0
  const heroId = card.hero_id

  if (!heroId || !['special', 'sss', 'ss'].includes(cardById.get(heroId)?.rarity ?? '')) {
    return 1
  }

  let total = 0.8
  let factor = 0.2

  for (let i = 1; i <= advanceNum; i++) {
    total += factor
    factor *= 3.0
  }

  return total
}

// 获取卡牌价值
export function getCardValue(card: Card): number {
  const heroId = card.hero_id
  if (!heroId) return 0
  const catalogCard = cardById.get(heroId)
  const baseValue: number = catalogCard?.value ?? 5

  // @ts-ignore - Record access returns number|undefined but we handle default above
  let rarityRate: number = 1
  if (catalogCard) rarityRate = cardAdvanceRates[catalogCard.rarity] as number

  const advanceMultiplier = getAdvanceMultiplier(card)

  return Math.round(baseValue * rarityRate * advanceMultiplier)
}

type WeaponColor = '红' | '粉' | '蓝'
type WeaponFeatureMap = Record<string, number> & { other: number }
type WeaponColorMap = Partial<Record<WeaponColor, WeaponFeatureMap>>
type WeaponValueMap = Record<string, WeaponColorMap>

export const weaponValues: WeaponValueMap = {
  '别鸣': {
    红: { '机敏': 20000, '灵动': 20000, other: 5000 },
    粉: { '机敏': 1000, '灵动': 800, other: 500 },
    蓝: { '机敏': 100, '灵动': 0, other: 0 },
  },
  '博浪': {
    红: { '机敏': 25000, '仁心': 20000, other: 5000 },
    粉: { '机敏': 1500, '仁心': 1500, other: 500 },
    蓝: { '机敏': 100, '仁心': 0, other: 0 },
  },
  '比翼': {
    红: { '济世': 10000, '仁心': 5000, other: 5000 },
    粉: { '济世': 1000, '仁心': 800, other: 500 },
    蓝: { '济世': 100, '仁心': 0, other: 0 },
  },
  '承影': {
    红: { '筹算': 10000, '天资': 5000, other: 5000 },
    粉: { '筹算': 1000, '天资': 800, other: 500 },
    蓝: { '筹算': 100, '天资': 0, other: 0 },
  },
  '沧海': {
    红: { '戒备': 10000, '坚韧': 5000, other: 5000 },
    粉: { '戒备': 1000, '坚韧': 800, other: 50 },
    蓝: { '戒备': 100, '坚韧': 0, other: 0 },
  },
  '大将': {
    红: { '灵动': 25000, '机敏': 20000, other: 5000 },
    粉: { '灵动': 1000, '机敏': 800, other: 500 },
    蓝: { '灵动': 100, '机敏': 0, other: 0 },
  },
  '大橹': {
    红: { '机敏': 15000, '稳固': 8000, other: 5000 },
    粉: { '机敏': 1000, '稳固': 800, other: 500 },
    蓝: { '机敏': 100, '稳固': 0, other: 0 },
  },
  '惊鲵': {
    红: { '英勇': 10000, '骁锐': 5000, other: 5000 },
    粉: { '英勇': 1000, '骁锐': 800, other: 500 },
    蓝: { '英勇': 100, '骁锐': 0, other: 0 },
  },
  '旌阳万仞': {
    红: { '筹算': 10000, '天资': 5000, other: 5000 },
    粉: { '筹算': 1000, '天资': 800, other: 500 },
    蓝: { '筹算': 100, '天资': 0, other: 0 },
  },
  '钜黍': {
    红: { '骁锐': 15000, '天资': 10000, other: 5000 },
    粉: { '骁锐': 2000, '天资': 800, other: 500 },
    蓝: { '骁锐': 100, '天资': 0, other: 0 },
  },
  '锟铻': {
    红: { '筹算': 10000, '天资': 5000, other: 5000 },
    粉: { '筹算': 1000, '天资': 800, other: 500 },
    蓝: { '筹算': 100, '天资': 0, other: 0 },
  },
  '龙鳞': {
    红: { '骁锐': 10000, '奔袭': 5000, other: 5000 },
    粉: { '骁锐': 1000, '奔袭': 800, other: 500 },
    蓝: { '骁锐': 100, '奔袭': 100, other: 0 },
  },
  '冥山勾月': {
    红: { '英勇': 10000, '晓锐': 5000, other: 5000 },
    粉: { '英勇': 1000, '晓锐': 800, other: 500 },
    蓝: { '英勇': 100, '晓锐': 100, other: 0 },
  },
  '铭鸿': {
    红: { '筹算': 20000, '英勇': 5000, other: 5000 },
    粉: { '筹算': 1200, '英勇': 800, other: 500 },
    蓝: { '筹算': 100, '英勇': 100, other: 0 },
  },
  '屈卢': {
    红: { '骁锐': 10000, '奔袭': 5000, other: 5000 },
    粉: { '骁锐': 1000, '奔袭': 800, other: 500 },
    蓝: { '骁锐': 100, '奔袭': 0, other: 0 },
  },
  '戚': {
    红: { '骁锐': 10000, '坚毅': 5000, other: 5000 },
    粉: { '骁锐': 1000, '坚毅': 800, other: 500 },
    蓝: { '骁锐': 100, '坚毅': 0, other: 0 },
  },
  '千钧': {
    红: { '灵动': 10000, '济世': 5000, other: 5000 },
    粉: { '灵动': 1000, '济世': 800, other: 500 },
    蓝: { '灵动': 100, '济世': 0, other: 0 },
  },
  '仁风': {
    红: { '灵动': 10000, '仁心': 5000, other: 5000 },
    粉: { '灵动': 1000, '仁心': 800, other: 500 },
    蓝: { '灵动': 100, '仁心': 0, other: 0 },
  },
  '少府': {
    红: { '骁锐': 10000, '陷阵': 5000, other: 5000 },
    粉: { '骁锐': 1000, '陷阵': 800, other: 500 },
    蓝: { '骁锐': 100, '陷阵': 0, other: 0 },
  },
  '神锋': {
    红: { '骁锐': 10000, '陷阵': 5000, other: 5000 },
    粉: { '骁锐': 1000, '陷阵': 800, other: 500 },
    蓝: { '骁锐': 100, '陷阵': 0, other: 0 },
  },
  '彤素': {
    红: { '英勇': 25000, '骁锐': 15000, other: 5000 },
    粉: { '英勇': 1000, '骁锐': 800, other: 500 },
    蓝: { '英勇': 100, '骁锐': 0, other: 0 },
  },
  '泰阿': {
    红: { '机敏': 10000, '灵动': 5000, other: 5000 },
    粉: { '机敏': 1000, '灵动': 800, other: 500 },
    蓝: { '机敏': 100, '灵动': 0, other: 0 },
  },
  '螣蛇': {
    红: { '熟虑': 10000, '天资': 5000, other: 5000 },
    粉: { '熟虑': 2000, '天资': 800, other: 500 },
    蓝: { '熟虑': 100, '天资': 0, other: 0 },
  },
  '乌号': {
    红: { '熟虑': 10000, '亢厉': 5000, other: 5000 },
    粉: { '熟虑': 2000, '亢厉': 800, other: 500 },
    蓝: { '熟虑': 100, '亢厉': 0, other: 0 },
  },
  '悬翦': {
    红: { '骁锐': 10000, '筹算': 5000, other: 5000 },
    粉: { '骁锐': 1000, '筹算': 800, other: 500 },
    蓝: { '骁锐': 100, '筹算': 0, other: 0 },
  },
  '徐氏匕首': {
    红: { '筹算': 10000, '天资': 5000, other: 5000 },
    粉: { '筹算': 1000, '天资': 800, other: 500 },
    蓝: { '筹算': 100, '天资': 0, other: 0 },
  },
  '貅猊': {
    红: { '骁锐': 10000, '坚毅': 5000, other: 5000 },
    粉: { '骁锐': 1000, '坚毅': 800, other: 500 },
    蓝: { '骁锐': 100, '坚毅': 0, other: 0 },
  },
  '星汉': {
    红: { '戒备': 10000, '不屈': 5000, other: 5000 },
    粉: { '戒备': 1000, '不屈': 800, other: 500 },
    蓝: { '戒备': 100, '不屈': 0, other: 0 },
  },
  '游飘': {
    红: { '筹算': 20000, '天资': 1000, other: 5000 },
    粉: { '筹算': 1000, '天资': 800, other: 500 },
    蓝: { '筹算': 100, '天资': 0, other: 0 },
  },
  '掩日': {
    红: { '熟虑': 10000, '天资': 5000, other: 5000 },
    粉: { '熟虑': 1000, '天资': 800, other: 500 },
    蓝: { '熟虑': 100, '天资': 0, other: 0 },
  },
  '元戎': {
    红: { '骁锐': 10000, '奔袭': 10000, other: 5000 },
    粉: { '骁锐': 2000, '奔袭': 2000, other: 500 },
    蓝: { '骁锐': 100, '奔袭': 0, other: 0 },
  },
  '狰角枪': {
    红: { '骁锐': 10000, '奔袭': 5000, other: 5000 },
    粉: { '骁锐': 1000, '奔袭': 800, other: 500 },
    蓝: { '骁锐': 100, '奔袭': 0, other: 0 },
  },
  '真刚': {
    红: { '英勇': 20000, '骁锐': 15000, other: 5000 },
    粉: { '英勇': 1500, '骁锐': 800, other: 500 },
    蓝: { '英勇': 100, '骁锐': 0, other: 0 },
  },
  '障日': {
    红: { '惑言': 10000, '机敏': 5000, other: 5000 },
    粉: { '惑言': 1000, '机敏': 800, other: 500 },
    蓝: { '惑言': 100, '机敏': 0, other: 0 },
  }
}

export function getWeaponValue(weapon: Weapon): number {
  const name = weapon?.name
  const color = weapon?.color as WeaponColor | undefined
  const featureName = weapon?.feature?.[0]?.[0]
  if (!name || !color || !featureName) return 0
  const weaponData = weaponValues[name]
  if (!weaponData) return 0
  const colorData = weaponData[color]
  if (!colorData) return 0
  return colorData[featureName] ?? colorData.other ?? 0
}
