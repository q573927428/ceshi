// composables/useFetchData.js
import { Loading } from '@element-plus/icons-vue';
import { getCardValue, getWeaponValue } from '~/utils/valueCalculator.js';

const allSkillIds = [
  200244, 200755, 200784, 200201, 200862,
  200754, 200959, 200964, 201008, 200276,
  200847, 200938, 200647, 200814, 200844,
  200789, 200801, 200886, 200237, 200235,
  200263, 200979, 200271, 200267, 200980,
  200252, 200788, 200863, 200900, 200274,
  200261, 200289
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const useFetchData = () => {

  const extractUniqueCards = (full) => {
    const list = (full.card || []).filter(c => c.quality === 5);
    const result = [];
    list.forEach(c => {
      const ex = result.find(r => r.hero_id === c.hero_id && r.season === c.season);
      if (!ex) result.push({ ...c });
      else if (c.advance_num > ex.advance_num) ex.advance_num = c.advance_num;
    });
    return result;
  };

  const extractWeapons = (full) => {
    const phase3 = (full.gear || []).filter(w => w.phase === 3);

    const compact = (w, color) => ({
      name: w.name,
      advance: w.advance,
      level_type: w.level_type,
      feature: w.feature,
      gear_id: w.gear_id,
      calculatedValue: getWeaponValue(w),
      color
    });

    const redWeapons = phase3
      .filter(w => w.advance === 1)
      .map(w => compact(w, '红'));

    const pinkWeapons = phase3
      .filter(w => w.level_type === 2 && w.advance !== 1)
      .map(w => compact(w, '粉'));

    const blueWeapons = phase3
      .filter(w => w.level_type === 0 && w.advance !== 1)
      .map(w => compact(w, '蓝'));

    return { redWeapons, pinkWeapons, blueWeapons };
  };

  const buildProcessedData = (extractedId, link, equip, full, weapons, uniqueCards) => {
    const cardTotalValue = uniqueCards.reduce((s, c) => s + getCardValue(c), 0);
    const allW = [...weapons.redWeapons, ...weapons.pinkWeapons, ...weapons.blueWeapons];
    allW.forEach(w => w.calculatedValue = getWeaponValue(w));
    const weaponTotalValue = allW.reduce((s, w) => s + w.calculatedValue, 0);

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
      uniqueCards: uniqueCards.map(c => ({
        hero_id: c.hero_id,
        icon_hero_id: c.icon_hero_id,
        advance_num: c.advance_num
      })),
      skill: (full.skill || [])
        .filter(s => allSkillIds.includes(s.skill_id))
        .map(s => ({
          skill_id: s.skill_id,
          name: s.name,
          skill_type: s.skill_type,
          research_progress: s.research_progress
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
      dynamic_icon: full.dynamic_icon ? full.dynamic_icon.length : 0
    };
  };

  // 主流程
  const fetchAccountData = async (link, record = null) => {
    // await sleep(5000 + Math.random() * 5000); // 随机等待
    const clean = link.split('?')[0];
    const match = clean.match(/\/equip\/1\/([A-Za-z0-9-]+)/);
    if (!match) throw new Error("无效ID");

    const extractedId = match[1];

    let equip;
    record = '6666'
    if (record === null) {
      equip = await $fetch('/api/equip/detail', { params: { ordersn: extractedId } });
    } else {
      equip = {
        price: record?.data?.equip?.price || 0,
        status_desc: record?.data?.equip?.status_desc || '',
        area_name: record?.data?.equip?.area_name || '',
        server_name: record?.data?.equip?.server_name || ''
      };
    }

    // 解析 full.json
    const jsonUrl = `https://cbg-other-desc.res.netease.com/stzb/static/equipdesc/${extractedId}.json`;
    const raw = await fetch(jsonUrl);
    const text = await raw.text();
    const parsed = JSON.parse(text);

    const decoded = parsed.equip_desc.replace(/\\u([0-9a-fA-F]{4})/g, (_, g) =>
      String.fromCharCode(parseInt(g, 16))
    );
    const full = JSON.parse(decoded);

    const uniqueCards = extractUniqueCards(full);
    const weapons = extractWeapons(full);

    return buildProcessedData(extractedId, link, equip, full, weapons, uniqueCards);
  };

  return {
    fetchAccountData
  };
};
