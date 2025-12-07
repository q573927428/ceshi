<template> 
    <div class="value-calculator">
      <h4>武将卡总价值：{{ cardTotalValue }}</h4>
  
      <h4>武器总价值：{{ weaponTotalValue }}</h4>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CardWeaponValue',
  
    props: {
      cards: { type: Array, default: () => [] },
      redWeapons: { type: Array, default: () => [] },
      pinkWeapons: { type: Array, default: () => [] },
      blueWeapons: { type: Array, default: () => [] },
    },
  
    data() {
      return {
        /** 你设定的武器价格体系 */
        weaponValues: {
            '别鸣': {
                红: { "骁锐": 10000, "奔袭": 5000, other: 3000 },
                粉: { "骁锐": 3000, "奔袭": 2000, other: 1000 },
                蓝: { "骁锐": 200, "奔袭": 100, other: 0 },
            },
            '博浪': {
                红: { "艮止": 10000, "机敏": 5000, other: 3000 },
                粉: { "艮止": 3000, "机敏": 2000, other: 1000 },
                蓝: { "艮止": 200, "机敏": 100, other: 0 },
            },
            '比翼': {
                红: { "仁心": 10000, "天资": 5000, other: 3000 },
                粉: { "仁心": 3000, "天资": 2000, other: 1000 },
                蓝: { "仁心": 200, "天资": 100, other: 0 },
            },
            '承影': {
                红: { "炫惑": 10000, "天资": 5000, other: 3000 },
                粉: { "炫惑": 3000, "天资": 2000, other: 1000 },
                蓝: { "炫惑": 200, "天资": 100, other: 0 },
            },
            '沧海': {
                红: { "奔袭": 10000, "骁锐": 5000, other: 3000 },
                粉: { "奔袭": 3000, "骁锐": 2000, other: 1000 },
                蓝: { "奔袭": 200, "骁锐": 100, other: 0 },
            }
        }
      };
    },
  
    computed: {
      /** 整体武器列表，统一格式 */
      allWeapons() {
        return [
          ...this.redWeapons.map(w => ({ ...w, color: '红' })),
          ...this.pinkWeapons.map(w => ({ ...w, color: '粉' })),
          ...this.blueWeapons.map(w => ({ ...w, color: '蓝' })),
        ];
      },
  
      /** 武将总价值 */
      cardTotalValue() {
        return this.cards.reduce((sum, c) => sum + this.getCardValue(c), 0);
      },
  
      /** 武器总价值 */
      weaponTotalValue() {
        return this.allWeapons.reduce((sum, w) => sum + this.getWeaponValue(w), 0);
      }
    },
  
    methods: {
      /** 武将卡价值计算（保持原逻辑） */
      getCardValue(card) {
        const cardBaseValues = {
            100028: 500, 100372: 500, 100479: 500, 100477: 500, 100476: 500, 100478: 500, 100480: 500, 100498: 500, 100496: 500, 100526: 500,
            100030: 500, 100016: 500, 100035: 500, 100023: 500, 100027: 500, 100013: 500, 100451: 500, 100619: 500, 100615: 500, 100337: 500,
            100685: 500, 100670: 500, 100692: 500, 100649: 500, 100787: 500, 100807: 500, 100808: 500, 100771: 500, 100794: 500, 100704: 500,
            100703: 500, 100708: 500, 100709: 500, 100792: 500, 100799: 500, 100785: 500, 100449: 500, 100604: 500, 100443: 500, 100620: 500,
            100021: 500, 102001: 500, 100648: 500, 100074: 500, 102012: 500, 100574: 500, 100741: 500, 100589: 500, 100618: 500, 100671: 500,
            100645: 500, 100474: 500, 100022: 500, 100677: 500, 100784: 500, 100630: 500, 100534: 500, 100647: 500, 100452: 500, 100701: 500,
            100705: 500, 100796: 500, 100791: 500, 100802: 500, 100805: 500, 100783: 500, 100769: 500, 100687: 500, 100072: 500, 100450: 500,
            100358: 500, 100020: 500, 100616: 500, 100034: 500, 100090: 500, 100024: 500, 100003: 500, 100631: 500, 100519: 500, 100582: 500,
            100553: 500, 100788: 500, 100689: 500, 100653: 500, 100683: 500, 100707: 500, 100494: 500, 102016: 500, 100019: 500, 100702: 500,
            100524: 500, 100790: 500, 100795: 500, 100801: 500, 100800: 500, 100691: 500, 100793: 500
        };
  
        const defaultCardBaseValue = 50;
        const baseValue = cardBaseValues[card.hero_id] ?? defaultCardBaseValue;
  
        const advanceRate = 0.2;
        return Math.round(baseValue * (1 + Math.min(card.advance_num, 5) * advanceRate));
      },
  
      /** 关键函数：根据武器名称 + 颜色 + feature[0][0] 找价值 */
      getWeaponValue(weapon) {
        const name = weapon?.name;
        const color = weapon?.color;
        const featureName = weapon?.feature?.[0]?.[0];  // 词条名，如“奔袭”
  
        if (!name || !color || !featureName) return 0;
  
        const weaponData = this.weaponValues[name];
        if (!weaponData) return 0;
  
        const colorData = weaponData[color];
        if (!colorData) return 0;
  
        // 匹配具体词条
        if (colorData[featureName] !== undefined) {
          return colorData[featureName];
        }
  
        // 匹配不到 → other
        return colorData.other ?? 0;
      }
    },
  
    watch: {
      cardTotalValue: {
        handler(val) { this.$emit('card-value-updated', val); },
        immediate: true
      },
      weaponTotalValue: {
        handler(val) { this.$emit('weapon-value-updated', val); },
        immediate: true
      }
    }
  };
  </script>
  
  <style scoped>
  .value-calculator {
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 6px;
    margin-top: 10px;
  }
  </style>
  