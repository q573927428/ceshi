export default defineEventHandler(() => ({ plans: [
  { id: 'quota10', name: '10 金币', quota: 10, amountFen: 100, description: '1 元 = 10 金币，可添加 10 个账号' },
  { id: 'quota100', name: '100 金币', quota: 100, amountFen: 1000, description: '一次性充值 100 金币，可添加 100 个账号' },
  { id: 'pro30', name: '专业会员 30 天', quota: 300, amountFen: 1990, description: '30 天会员权益，额外赠送 300 金币' },
] }))
