// utils/valueCalculator.ts

import CategoryCardsList from '~/components/CategoryCardsList.vue'
import treasures from '~/data/treasures.json'

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
  // 接口通常返回 [特性名, 特性描述, 特性 ID]
  // 使用数组而非固定长度元组，兼容接口及 useFetchData 中的精简类型。
  feature?: Array<Array<string | number | undefined>>
}

type TreasureFeature = {
  name?: string
  ids?: readonly number[]
  // JSON 中各行字段并非固定长度，使用只读宽松数组兼容自动推断类型。
  list?: readonly (readonly unknown[])[]
}
type Treasure = { label?: string; featureNames?: readonly TreasureFeature[] }

const treasureByName = new Map(
  (treasures as unknown as readonly Treasure[]).map(treasure => [treasure.label, treasure] as const)
)

/** 从 treasures.json 查找红/粉特性的价格。 */
function getTreasurePrice(weapon: Weapon, color: WeaponColor): number | undefined {
  if (color === '蓝' || !weapon.name) return 0

  const feature = weapon.feature?.[0]
  if (!feature) return undefined
  const [featureName, description, featureId] = feature
  if (typeof featureName !== 'string') return undefined
  const treasure = treasureByName.get(weapon.name)
  const treasureFeature = treasure?.featureNames?.find(item => item.name === featureName)
  if (!treasureFeature?.list?.length) return undefined

  const idIndex = typeof featureId === 'number'
    ? treasureFeature.ids?.indexOf(featureId) ?? -1
    : -1
  const row = idIndex >= 0
    ? treasureFeature.list[idIndex]
    : treasureFeature.list.find(item => typeof description === 'string' && item[1] === description)
  if (!row) return undefined

  // 红色为最后一档（标记位为 1），粉色为其余档位；调用方传入的颜色决定是否接受该行。
  const isRedRow = row[3] === 1
  if ((color === '红') !== isRedRow) return undefined
  const rawPrice = row[2]
  if (rawPrice == null || rawPrice === '') return undefined
  const price = Number(String(rawPrice).replace(/^s/i, ''))
  return Number.isFinite(price) ? price : undefined
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
export function getWeaponValue(weapon: Weapon): number {
  const name = weapon?.name
  const color = weapon?.color as WeaponColor | undefined
  const featureName = weapon?.feature?.[0]?.[0]
  if (!name || !color || !featureName) return 0
  // 普通蓝色武器不计价；红、粉优先使用 treasures.json 中对应等级的价格。
  if (color === '蓝') return 0
  const treasurePrice = getTreasurePrice(weapon, color)
  return treasurePrice ?? 0
}
