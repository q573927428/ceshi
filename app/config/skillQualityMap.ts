import skills from '~/data/skills.json'

/** 战法品质。品质数据以 skills.json 中的 zfQuality 为唯一来源。 */
export type SkillQuality = 'S' | 'A' | 'B' | 'C' | 'D'

/** skill id -> 战法品质 */
const skillQualityMap: Record<number, SkillQuality> = Object.fromEntries(
  skills.map((skill) => [skill.id, skill.zfQuality as SkillQuality]),
) as Record<number, SkillQuality>

// 保留历史命名，避免已有调用方因拼写问题无法继续使用。
export const skillQuBlityMBp = skillQualityMap

export default skillQualityMap
