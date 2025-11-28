<template>
  <div v-if="accountData && accountData.gear" class="weapons-container">
    <div class="weapon-group" v-if="redWeapons.length > 0">
      <h3>红武</h3>
      <div class="weapons-list">
        <WeaponCard 
          v-for="weapon in redWeapons" 
          :key="weapon.gear_id"
          :card="weapon"
        />
      </div>
    </div>
    
    <div class="weapon-group" v-if="pinkWeapons.length > 0">
      <h3>粉武</h3>
      <div class="weapons-list">
        <WeaponCard 
          v-for="weapon in pinkWeapons" 
          :key="weapon.gear_id"
          :card="weapon"
        />
      </div>
    </div>
    
    <div class="weapon-group" v-if="blueWeapons.length > 0">
      <h3>蓝武</h3>
      <div class="weapons-list">
        <WeaponCard 
          v-for="weapon in blueWeapons" 
          :key="weapon.gear_id"
          :card="weapon"
        />
      </div>
    </div>
  </div>
</template>

<script>
import WeaponCard from './WeaponCard.vue';

export default {
  name: 'WeaponList',
  components: {
    WeaponCard
  },
  props: {
    accountData: {
      type: Object,
      default: () => ({})
    },
    redWeapons: {
      type: Array,
      default: () => []
    },
    pinkWeapons: {
      type: Array,
      default: () => []
    },
    blueWeapons: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.weapons-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.weapon-group h3 {
  margin-bottom: 10px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.weapons-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>