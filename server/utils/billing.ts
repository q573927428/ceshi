export const STANDARD_ACCOUNT_COIN_COST = 5
export const PRO_ACCOUNT_COIN_COST = 3
export const NEW_USER_COIN_BONUS = 5

export function hasActiveProMembership(user: any, now = Date.now()) {
  if (user?.plan !== 'pro') return false
  if (!user.plan_expires_at) return true

  const expiresAt = new Date(user.plan_expires_at).getTime()
  return Number.isFinite(expiresAt) && expiresAt > now
}

export function getAccountCoinCost(user: any) {
  return hasActiveProMembership(user) ? PRO_ACCOUNT_COIN_COST : STANDARD_ACCOUNT_COIN_COST
}
