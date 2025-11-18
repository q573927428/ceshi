<template>
    <div class="zangbao-page">
      <!-- 页面标题 -->
      <!-- <el-page-header title="藏宝阁链接" /> -->
  
      <!-- 链接区域 -->
      <div class="link-section">
        <h3>藏宝阁链接:</h3>
        <textarea v-model="zangbaoLink" placeholder="163张五星武将卡， 26个稀世宝物，27个S级战法 https://stzb.cbg.163.com/cgi/mweb/equip/1/202510261802116-1-NWCGRIWQUFKXBJ?view_loc=reco_home%7Ctag_key%3A%7B%22exposed_scene_id%22%3A%20%221763281118863-5c17696e%22,%20%22is_from_ad_reco%22%3A%200,%20%22tag%22%3A%20%22general_rec_din_tfs%22%7D&reco_request_id=1763281120787czbd8&tag=general_rec_din_tfs&tfid=f_reco_home&tcid=c_reco_home&exposed_scene_id=1763281118863-5c17696e&refer_sn=019A8BBE-A612-8A81-35CB-0E4693E9E526"></textarea>
      </div>
  
      <!-- 按钮区域 -->
      <div class="button-section">
        <el-button type="primary" @click="extractData">一键估号</el-button>
        <el-button type="primary" @click="resetOpacity">重置透明度</el-button>
        <el-button type="info" @click="handleShare">分享给好友</el-button>
      </div>
  
      <!-- 卡池价格信息 -->
      <div class="price-section">
        <div class="price-item">
          <span>卡池价格</span>
          <strong>0</strong>
        </div>
        <div class="price-item">
          <span>武器价格</span>
          <strong>0</strong>
        </div>
        <div class="price-item">
          <span>总价格</span>
          <strong>0</strong>
        </div>
      </div>

      <!-- 卡池价格信息 -->
      <div class="season-info" v-if="accountData">
        <div class="season-item">
          <div><span>区服：</span> {{ tenures.combine_name }} {{ tenures.server_info }} </div>
          <div><span>类型：</span> {{ tenures.server_info }} </div>
        </div>
        <div class="season-item">
          <div><span>藏宝阁价格：</span> {{ tenures.combine_name }} </div>
          <div><span>试师号价格：</span> {{ tenures.combine_name }} </div>
        </div>
      </div>
  
      <!-- 底部标签栏 -->
      <el-tabs v-model="activeTab" class="tabs-assort">
        <el-tab-pane label="武将" name="first">
          <CategoryCards ref="categoryCards" />
        </el-tab-pane>
        <el-tab-pane label="技能" name="second">
          <SkillCard ref="skillCard" />
        </el-tab-pane>
        <el-tab-pane label="武器" name="third">
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
        </el-tab-pane>
        <el-tab-pane label="阵容" name="fourth">
          <!-- 条件渲染：只有当 uniqueCards 存在时才渲染 FormationComponent -->
          <FormationComponent v-if="uniqueCards && uniqueCards.length > 0" :uniqueCards="uniqueCards" />
        </el-tab-pane>
        <el-tab-pane label="其他" name="fifth">
          <div class="other-resources">
            <ul>
              <li>虎符：{{ tenures.hufu }}</li>
              <li>普通玉符：{{ tenures.bind_yuan_bao }}</li>
              <li>四通玉符：{{ tenures.yuan_bao }}</li>
              <li>将令：{{ tenures.jiang_ling }}</li>
              <li>荣誉：{{ tenures.honor }}</li>
              <li>赤珠山铁：{{ tenures.chi_zhu_shan_tie }}个</li>
              <li>小叶紫檀：{{ tenures.xiao_ye_zi_tan }}个</li>
              <li>天工锤：{{ tenures.gear_feature_hammer }}个</li>
              <li>皮肤：{{ tenures.dynamic_icon }}个</li>
            </ul>
          </div>
          <div class="dynamic_icon">
            <!-- 把所有武将画像遍历显示到这个位置 -->
            <div v-if="accountData && accountData.dynamic_icon" class="dynamic-icon-container">
              <div 
                v-for="card in accountData.dynamic_icon"
                :key="card.icon_hero_id"
                class="dynamic-icon-item"
              >
                <img 
                  :src="`https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${card.icon_hero_id}.jpg`"
                  :alt="card.name"
                  class="dynamic-icon-image"
                >
                <div class="card-name">{{ card.name }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
  
    </div>
  </template>
  
  <script>
  import CategoryCards from '~/components/CategoryCards.vue';
  import SkillCard from '~/components/SkillCard.vue';
  import WeaponCard from '~/components/WeaponCard.vue';
  import FormationComponent from '~/components/FormationComponent.vue'; // 新增导入 FormationComponent

  export default {
    components: {
      CategoryCards,
      SkillCard,
      WeaponCard,
      FormationComponent // 新增 FormationComponent 组件
    },
    data() {
      return {
        zangbaoLink: 'https://stzb.cbg.163.com/cgi/mweb/equip/1/202510281502116-1-RU4G0IXMKDLWYW?refer_sn=019A910B-06A2-9A01-8E07-8A111122F68A',
        activeTab: 'first',
        extractedId: '',
        jsonData: null,
        uniqueCards: null,
        accountData: null,  // 存储从藏宝阁链接提取的数据
        tenures: {
          yuan_bao: 0,
          jiang_ling: 0,
          bind_yuan_bao: 0,
          hufu: 0,
          honor: 0,
          chi_zhu_shan_tie: 0,
          xiao_ye_zi_tan: 0,
          gear_feature_hammer: 0,
          dynamic_icon: 0,
          season_info:"",
          server_info:"",
          combine_name:"",
          server_id:0,
          platform:"",
          get_reward_time_limit:""
        }
      };
    },
    computed: {
      // 先筛选phase值为3的武器
      phase3Weapons() {
        if (!this.accountData || !this.accountData.gear) {
          return [];
        }
        return this.accountData.gear.filter(weapon => weapon.phase === 3);
      },
      
      // 红武: advance值为1的武器（从phase3Weapons中筛选）
      redWeapons() {
        return this.phase3Weapons.filter(weapon => weapon.advance === 1);
      },
      
      // 粉武: level_type值为2的武器（从phase3Weapons中筛选，但排除红武）
      pinkWeapons() {
        return this.phase3Weapons.filter(weapon => weapon.level_type === 2 && weapon.advance !== 1);
      },
      
      // 蓝武: level_type值为0的武器（从phase3Weapons中筛选，但排除红武）
      blueWeapons() {
        return this.phase3Weapons.filter(weapon => weapon.level_type === 0 && weapon.advance !== 1);
      },
      
      // 筛选出 phase 值为 3 的武器（保留原计算属性以保持代码兼容性）
      filteredWeapons() {
        return this.phase3Weapons;
      }
    },
    methods: {
      async extractData() {
        //zangbaoLink不能为空
        if (this.zangbaoLink ==='') {
          ElMessage.error('请输入藏宝阁链接');
          return;
        }

        // 重置卡片状态为初始状态
        this.resetOpacity();
        
        // 使用正则表达式提取ID
        const regex = /\/equip\/1\/([a-zA-Z0-9\-]+)/;
        const match = this.zangbaoLink.match(regex);

        if (match && match[1]) {
          this.extractedId = match[1];
          
          // 构建API URL
          const apiUrl = `https://cbg-other-desc.res.netease.com/stzb/static/equipdesc/${this.extractedId}.json`;
          
          try {
            // 获取JSON数据
            const response = await fetch(apiUrl);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // 获取响应文本
            const textData = await response.text();
            const parsedData = JSON.parse(textData); 

            const decodedData = parsedData.equip_desc.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => {
              return String.fromCharCode(parseInt(grp, 16));
            });
            const aaData = JSON.parse(decodedData); 
            // console.log('解析后的账号数据:', aaData);
            

            // 临时存储完整的账号数据，便于后续处理
            this.accountData = aaData;

            // 筛选 quality 为 5 的数据
            const quality5Cards = aaData.card.filter(card => card.quality === 5);

            // 根据 icon_hero_id 去重，保留 advance_num 最大的记录
            const uniqueCards = quality5Cards.reduce((acc, card) => {
              // 使用 icon_hero_id 作为唯一标识
              const existingCard = acc.find(c => c.hero_id === card.hero_id && c.season === card.season);
              
              if (existingCard) {
                // 如果已存在相同 icon_hero_id 的卡片，比较 advance_num 并保留较大的
                if (card.advance_num > existingCard.advance_num) {
                  existingCard.advance_num = card.advance_num;
                  // 同时更新其他可能变化的属性
                  existingCard.name = card.name;
                  existingCard.country = card.country;
                  existingCard.awake_state = card.awake_state;
                  existingCard.policy_awake_state = card.policy_awake_state;
                  existingCard.hero_achieve = card.hero_achieve;
                  existingCard.is_support = card.is_support;
                  existingCard.season = card.season;
                  existingCard.icon_hero_id = card.icon_hero_id;
                }
              } else {
                // 如果不存在，则添加新卡片
                acc.push(card);
              }
              return acc;
            }, []);

            this.uniqueCards = uniqueCards;
            this.updateSomeCards()
            this.updateSkill()
            this.getTenure()
          } catch (error) {
            console.error('获取或解析数据时出错:', error);
            const errorMessage = error && error.message ? error.message : '未知错误';
            ElMessage.error('获取或解析数据失败: ' + errorMessage);
          }
        } else {
          ElMessage.error('未找到有效的ID');
        }
      },
      
      // 处理Unicode转义序列的函数
      decodeUnicode(str) {
        return str.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => {
          return String.fromCharCode(parseInt(grp, 16));
        });
      },
      
      handleCopy() {
        // 复制链接逻辑
      },
      
      handleShare() {
        // 分享逻辑
      },
      
      updateSomeCards() {
        // 模拟从服务器获取到的卡片ID列表
        const uniqueCards = this.uniqueCards
        this.$refs.categoryCards.updateCardOpacity(uniqueCards)
      },
      updateSkill() {
        // 模拟从服务器获取到的技能ID列表
        const skills = this.accountData.skill;
        this.$refs.skillCard.updateSkillOpacity(skills)
      },
      
      resetOpacity() {
        // 重置所有卡片透明度
        this.uniqueCards = null;
        this.$refs.categoryCards.categories.forEach(category => {
          category.cards.forEach(card => {
            card.opacity = 0.3
            card.advance_num = 0
            card.policy_awake_state = 0
          })
        })
        //重置技能透明度
        this.$refs.skillCard.categories.forEach(category => {
          category.skills.forEach(skill => {
            skill.opacity = 0.3
            skill.research_progress = 100
          })
        })
      },
      getTenure(){
        const yuan_bao = this.accountData.tenure.yuan_bao;
        const yue_ka_endtime = this.accountData.tenure.yue_ka_endtime;
        const jiang_ling = this.accountData.tenure.jiang_ling;
        const bind_yuan_bao = this.accountData.tenure.bind_yuan_bao;
        const hufu = this.accountData.tenure.hufu;
        const honor = this.accountData.tenure.honor;
        const chi_zhu_shan_tie = this.accountData.material.chi_zhu_shan_tie.value;
        const xiao_ye_zi_tan = this.accountData.material.xiao_ye_zi_tan.value;
        const gear_feature_hammer = this.accountData.material.gear_feature_hammer.value;
        const dynamic_icon = this.accountData.dynamic_icon.length;

        const season_info = this.accountData.season_info;
        const server_info = this.accountData.server_info;
        const combine_name = this.accountData.combine_name;
        const server_id = this.accountData.server_id;
        const platform = this.accountData.platform;
        const get_reward_time_limit = this.accountData.get_reward_time_limit;
        
        this.tenures = {
          yuan_bao,
          yue_ka_endtime,
          jiang_ling,
          bind_yuan_bao,
          hufu,
          honor,
          chi_zhu_shan_tie,
          xiao_ye_zi_tan,
          gear_feature_hammer,
          dynamic_icon,
          season_info,
          server_info,
          combine_name,
          server_id,
          platform,
          get_reward_time_limit
        };

      },
      //处理gear数据


    }
  };
  </script>
  
  <style scoped>
  .zangbao-page {
    padding: 16px;
  }
  
  .link-section textarea {
    width: 100%;
    height: 80px;
    resize: none;
  }
  
  .button-section {
    margin-top: 16px;
    text-align: center;
  }
  
  .price-section {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }
  
  .price-item {
    flex: 1;
    text-align: center;
    padding: 15px 0;
    border: 1px solid #ccc;
    border-radius: 8px;
    background: #f5f5f5;
    margin: 0 8px;
  }

  .season-info {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }
  .season-item { 
    flex: 1;
    text-align: center;
    padding: 15px 0;
    border: 1px solid #ccc;
    border-radius: 8px;
  
    margin: 0 8px;
  }
  
  .card-col {
    margin-bottom: 20px;
  }
  
  .card-assort {
    background: #f5f5f5;
    width: 100%;
    padding: 20px 0;
    border-radius: 20px;
  }
  .card-assort-title {
    margin-bottom: 5px;
    padding-left: 20px;
    font-weight: 600;
  }

  .other-resources li{
    list-style: none;
  }

  .tabs-assort {
    margin-top: 20px;
  }
  
  /* 添加平均分配标签宽度的样式 */
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
  
  :deep(.el-tabs__nav) {
    display: flex;
    width: 100%;
  }
  
  :deep(.el-tabs__item) {
    flex: 1;
    text-align: center;
  }
  
  .dynamic-icon-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .dynamic-icon-item {
    text-align: center;
    width: 100px;
  }
  
  .dynamic-icon-image {
    width: 100px;
    height: auto;
  }
  
  .card-name {
    font-size: 12px;
    margin-top: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
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
  
  .weapons-container {
    margin-top: 0;
  }
  </style>