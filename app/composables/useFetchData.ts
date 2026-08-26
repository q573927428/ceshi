// composables/useFetchData.ts
import { getCardValue, getWeaponValue } from '~/utils/valueCalculator'

const allSkillIds: number[] = [
  200244, 200755, 200784, 200201, 200862,
  200754, 200959, 200964, 201008, 200276,
  200847, 200938, 200647, 200814, 200844,
  200789, 200801, 200886, 200237, 200235,
  200263, 200979, 200271, 200267, 200980,
  200252, 200788, 200863, 200900, 200274,
  200261, 200289, 200280,
]

interface CardData {
  hero_id: number
  season?: number
  advance_num?: number
  quality?: number
  name?: string
  icon_hero_id?: number
  [key: string]: any
}

interface WeaponData {
  name?: string
  phase?: number
  advance?: number
  level_type?: number
  feature?: Array<[string]>
  gear_id?: number
  color?: string
  calculatedValue?: number
  [key: string]: any
}

interface EquipData {
  price: number
  status_desc: string
  area_name: string
  server_name: string
}

interface ProcessedData {
  extractedId: string
  link: string
  equipPrice: number
  statusDesc: string
  equip: {
    price: number
    status_desc: string
    area_name: string
    server_name: string
  }
  uniqueCards: Array<{
    name: string
    hero_id: number
    icon_hero_id: number
    advance_num: number
  }>
  skill: Array<{
    skill_id: number
    name: string
    skill_type: number
    research_progress: number
  }>
  redWeapons: WeaponData[]
  pinkWeapons: WeaponData[]
  blueWeapons: WeaponData[]
  cardTotalValue: number
  weaponTotalValue: number
  estimatedPrice: number
  tenures: {
    yuan_bao: number
    bind_yuan_bao: number
    honor: number
    jiang_ling: number
    hufu: number
    chi_zhu_shan_tie: number
    xiao_ye_zi_tan: number
    gear_feature_hammer: number
  }
  dynamic_icon: number
}

interface RecordData {
  data?: {
    equip?: EquipData
    [key: string]: any
  }
  [key: string]: any
}

export const useFetchData = () => {
  const extractUniqueCards = (full: any): CardData[] => {
    const list = (full.card || []).filter((c: CardData) => c.quality === 5)
    const result: CardData[] = []
    list.forEach((c: CardData) => {
      const ex = result.find((r) => r.hero_id === c.hero_id && r.season === c.season)
      if (!ex) result.push({ ...c })
      else if ((c.advance_num || 0) > (ex.advance_num || 0)) ex.advance_num = c.advance_num
    })
    return result
  }

  const extractWeapons = (full: any) => {
    const phase3 = (full.gear || []).filter((w: WeaponData) => w.phase === 3)

    const compact = (w: WeaponData, color: string) => ({
      name: w.name,
      advance: w.advance,
      level_type: w.level_type,
      feature: w.feature,
      gear_id: w.gear_id,
      calculatedValue: getWeaponValue(w),
      color,
    })

    const redWeapons = phase3
      .filter((w: WeaponData) => w.advance === 1)
      .map((w: WeaponData) => compact(w, '红'))

    const pinkWeapons = phase3
      .filter((w: WeaponData) => w.level_type === 2 && w.advance !== 1)
      .map((w: WeaponData) => compact(w, '粉'))

    const blueWeapons = phase3
      .filter((w: WeaponData) => w.level_type === 0 && w.advance !== 1)
      .map((w: WeaponData) => compact(w, '蓝'))

    return { redWeapons, pinkWeapons, blueWeapons }
  }

  const buildProcessedData = (
    extractedId: string,
    link: string,
    equip: EquipData,
    full: any,
    weapons: ReturnType<typeof extractWeapons>,
    uniqueCards: CardData[]
  ): ProcessedData => {
    const cardTotalValue = uniqueCards.reduce((s, c) => s + getCardValue(c), 0)
    const allW = [...weapons.redWeapons, ...weapons.pinkWeapons, ...weapons.blueWeapons]
    allW.forEach((w) => (w.calculatedValue = getWeaponValue(w)))
    const weaponTotalValue = allW.reduce((s, w) => s + (w.calculatedValue || 0), 0)

    console.log('full', full);
    
    return {
      extractedId,
      link,
      equipPrice: equip.price / 100,
      statusDesc: equip.status_desc,
      equip: {
        price: equip.price,
        status_desc: equip.status_desc,
        area_name: equip.area_name,
        server_name: equip.server_name,
      },
      uniqueCards: uniqueCards.map((c) => ({
        name: c.name || '',
        hero_id: c.hero_id,
        icon_hero_id: c.icon_hero_id || 0,
        advance_num: c.advance_num || 0,
      })),
      // 保留账号接口返回的全部战法，前端可按名称搜索并自定义分组
      skill: (full.skill || [])
        .map((s: any) => ({
          skill_id: s.skill_id,
          name: s.name,
          skill_info: s.skill_info,
          quality: s.quality,
          skill_type: s.skill_type,
          research_progress: s.research_progress,
        })),
      ...weapons,
      cardTotalValue,
      weaponTotalValue,
      estimatedPrice: cardTotalValue + weaponTotalValue,
      tenures: {
        yuan_bao: full.tenure?.yuan_bao || 0,
        bind_yuan_bao: full.tenure?.bind_yuan_bao || 0,
        honor: full.tenure?.honor || 0,
        jiang_ling: full.tenure?.jiang_ling || 0,
        hufu: full.tenure?.hufu || 0,
        chi_zhu_shan_tie: full.material?.chi_zhu_shan_tie?.value || 0,
        xiao_ye_zi_tan: full.material?.xiao_ye_zi_tan?.value || 0,
        gear_feature_hammer: full.material?.gear_feature_hammer?.value || 0,
      },
      dynamic_icon: full.dynamic_icon ? full.dynamic_icon.length : 0,
    }
  }

  // 主流程 - extractedId 即数据库中的 link（账号ID）
  const fetchAccountData = async (extractedId: string, record: RecordData | null = null): Promise<ProcessedData> => {
    let equip: EquipData

    if (record === null) {
      // @ts-ignore - Nuxt $fetch has complex route types
      equip = await $fetch('/api/equip/detail', {
        params: { ordersn: extractedId },
      }) as any
    } else {
      equip = {
        price: record?.data?.equip?.price || 0,
        status_desc: record?.data?.equip?.status_desc || '',
        area_name: record?.data?.equip?.area_name || '',
        server_name: record?.data?.equip?.server_name || '',
      }
    }

    // 解析 full.json
    const jsonUrl = `https://cbg-other-desc.res.netease.com/stzb/static/equipdesc/${extractedId}.json`
    const raw = await fetch(jsonUrl)
    const text = await raw.text()
    const parsed = JSON.parse(text)

    const decoded = parsed.equip_desc.replace(/\\u([0-9a-fA-F]{4})/g, (_match: string, g: string) =>
      String.fromCharCode(parseInt(g, 16))
    )
    const full = JSON.parse(decoded)

    const uniqueCards = extractUniqueCards(full)
    const weapons = extractWeapons(full)

    return buildProcessedData(extractedId, extractedId, equip, full, weapons, uniqueCards)
  }

  return {
    fetchAccountData,
  }
}
