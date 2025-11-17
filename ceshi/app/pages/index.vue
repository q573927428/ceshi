<template>
  <div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="技能" name="first">
        <!-- 技能内容 -->
      </el-tab-pane>
      <el-tab-pane label="成就" name="second">
        <!-- 成就内容 -->
      </el-tab-pane>
      <el-tab-pane label="武器" name="third">
        <div class="weapon-list">
          <WeaponCard
            v-for="gear in accountData.gear"
            :key="gear.gear_id"
            :card="gear"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import WeaponCard from '~/components/WeaponCard.vue';

// 假设 accountData 是从 API 获取的数据
const accountData = {
  gear: [
    {
      gear_id: 1027,
      name: '别鸣',
      rare: 'ji',
      feature: '红色词条',
      desc: '造成策略伤害的武将主战法发动率提高8.0%',
      fourSpeed: 5000,
    },
    {
      gear_id: 1028,
      name: '破阵',
      rare: 'xishi',
      feature: '粉色词条',
      desc: '造成攻击伤害的武将主战法发动率提高10.0%',
      fourSpeed: 4500,
    },
    // 更多武器数据...
  ],
};

const activeTab = ref('first');
</script>

<style scoped>
.weapon-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
}
</style>