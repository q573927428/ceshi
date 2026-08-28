export default defineEventHandler(() => ({ plans: [
  { id: 'quota100', name: '100 金币', quota: 100, amountFen: 1000, description: '一次性充值 100 金币，可添加 100 个账号' },
  { id: 'quota500', name: '500 金币', quota: 500, amountFen: 5000, description: '一次性充值 500 金币，可添加 500 个账号' },
  { id: 'quota1000', name: '1000 金币', quota: 1000, amountFen: 10000, description: '一次性充值 1000 金币，可添加 1000 个账号' },
  { id: 'quota2000', name: '2000 金币', quota: 2000, amountFen: 20000, description: '一次性充值 2000 金币，可添加 2000 个账号' },
  { id: 'quota5000', name: '5000 金币', quota: 5000, amountFen: 50000, description: '一次性充值 5000 金币，可添加 5000 个账号' },
  { id: 'pro30', name: '专业会员 30 天', quota: 300, amountFen: 1990, description: '30 天会员权益，额外赠送 300 金币' },
] }))
