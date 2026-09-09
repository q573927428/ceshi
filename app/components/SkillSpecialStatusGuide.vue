<template>
  <div class="status-guide-trigger">
    <el-button :icon="WarningFilled" @click="openGuide">技能特殊状态说明</el-button>

    <el-dialog
      v-model="visible"
      class="status-guide-dialog"
      :fullscreen="fullscreen"
      width="min(1180px, 96vw)"
      destroy-on-close
      append-to-body
    >
      <template #header>
        <div class="dialog-heading">
          <div>
            <h2>技能特殊状态说明</h2>
            <span>率土之滨 · 负面状态速查</span>
          </div>
          <el-button :icon="FullScreen" text @click="fullscreen = !fullscreen">
            {{ fullscreen ? '退出全屏' : '横屏全屏' }}
          </el-button>
        </div>
      </template>

      <div class="guide-content">
        <section>
          <h3>关键概念</h3>
          <div class="concept-grid">
            <div v-for="item in concepts" :key="item.title" class="concept-item">
              <strong>{{ item.title }}</strong>
              <p>{{ item.content }}</p>
            </div>
          </div>
        </section>

        <section>
          <h3>一、硬控类 <small>洞察可免疫这 5 个</small></h3>
          <div class="status-list">
            <div v-for="item in hardControls" :key="item.name" class="status-item">
              <div class="status-name"><strong>{{ item.name }}</strong><span>{{ item.examples }}</span></div>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </section>

        <section>
          <h3>二、特殊限制 <small>洞察不免疫</small></h3>
          <div class="status-item single-item">
            <div class="status-name"><strong>围困</strong><span>火烧连营等</span></div>
            <p>无法恢复兵力，急救 / 休整全部无效；不直接扣兵。</p>
          </div>
        </section>

        <section>
          <h3>三、持续伤害 DOT <small>洞察不管</small></h3>
          <p class="section-note">同类 DOT 同来源不能叠加；指挥 DOT 与主动 DOT 可共存。主动镇静可清主动来源 DOT；郝昭被动镇静可全部清除。</p>
          <div class="status-list">
            <div v-for="item in dotStatuses" :key="item.name" class="status-item">
              <div class="status-name"><strong>{{ item.name }}</strong><span>{{ item.examples }}</span></div>
              <p>{{ item.description }}</p>
            </div>
          </div>
          <el-alert title="战法【妖术】会施加暴走；状态「妖术」是诅咒 DOT，两者不同。" type="warning" :closable="false" show-icon />
        </section>

        <section>
          <h3>四、属性减益 <small>洞察无效</small></h3>
          <p class="section-note">攻击 / 谋略 / 防御 / 速度降低；受到伤害提升、造成伤害降低。主动镇静只能清主动来源；郝昭被动镇静可全部清除。</p>
        </section>

        <section>
          <h3>实战对照</h3>
          <p class="section-note">表格可左右滑动，点击右上角“横屏全屏”可获得更大查看区域。</p>
          <div class="comparison-table-wrap">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th>负面状态来源</th>
                  <th v-for="column in comparisonColumns" :key="column.title">
                    {{ column.title }}
                    <small>{{ column.skills }}</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in comparisonRows" :key="row.source">
                  <th>{{ row.source }}</th>
                  <td v-for="(value, index) in row.values" :key="index" :class="cellClass(value)">{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>口诀总结</h3>
          <ol class="summary-list">
            <li v-for="item in summaries" :key="item">{{ item }}</li>
          </ol>
        </section>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { FullScreen, WarningFilled } from '@element-plus/icons-vue'

const visible = ref(false)
const fullscreen = ref(false)

const openGuide = () => {
  fullscreen.value = window.matchMedia('(max-width: 700px)').matches
  visible.value = true
}

watch(visible, isVisible => {
  document.documentElement.classList.toggle('status-guide-open', isVisible)
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('status-guide-open')
})

const concepts = [
  { title: '预备状态', content: '战必、反计等一类指挥会先挂「怯战预备 / 犹豫预备」，每回合行动前才转为正式怯战、犹豫。' },
  { title: '镇静（移除有害）', content: '优先级：被动＞指挥＞主动=追击；低级镇静清不掉高级来源 debuff。特例：郝昭被动【不动如山】行动时移除全部有害效果，不受该限制。' },
  { title: '洞察', content: '直接免疫怯战、犹豫、混乱、暴走、挑衅，无视战法优先级；不能清 DOT、围困、属性降低。' },
  { title: '抵御', content: '只能阻止状态施加；已经挂上的状态无法消除。' },
  { title: '免疫', content: 'debuff 还挂在身上，但本回合效果不生效（例：疾战免疫怯战）。' },
]

const hardControls = [
  { name: '怯战', examples: '战必 / 当阳桥', description: '无法普通攻击；追击也无法触发；主动战法可正常释放。' },
  { name: '犹豫', examples: '反计 / 当阳桥', description: '无法发动主动战法，会打断准备中的主动；普攻、追击可正常执行。' },
  { name: '混乱', examples: '浑水 / 妲己', description: '完全无法行动：不能普攻、主动、反击。' },
  { name: '暴走', examples: '妖术战法', description: '普攻与主动不分敌我随机目标，可能打自己；发动率强制 100%。' },
  { name: '挑衅（嘲讽）', examples: '', description: '普通攻击必须打挑衅施加者，无视距离；不影响主动战法。' },
]

const dotStatuses = [
  { name: '恐慌', examples: '楚歌 / 匠心', description: '谋略伤害，行动前掉兵。' },
  { name: '火攻', examples: '焰焚箕轸', description: '谋略伤害，行动前掉兵。' },
  { name: '燃烧', examples: '火烧连营', description: '谋略伤害，行动前掉兵。' },
  { name: '动摇', examples: '风声鹤唳', description: '兵刃伤害，行动前掉兵。' },
  { name: '妖术（诅咒 DOT）', examples: '算无遗策等', description: '多为试图发动主动时触发扣血，≠ 暴走战法。' },
]

const comparisonColumns = [
  { title: '被动镇静', skills: '郝昭【不动如山】' },
  { title: '被动镇静', skills: '垒石' },
  { title: '指挥镇静', skills: '【僭越】' },
  { title: '主动镇静', skills: '孙权 / 全军突击 / 安抚军心' },
  { title: '抵御', skills: '审时定计 / 七擒七纵' },
  { title: '洞察', skills: '凌统 / 高顺 / 枭雄 / 始计等' },
  { title: '特殊兵种免疫', skills: '象兵 / 藤甲兵' },
  { title: '仅免疫怯战', skills: '魏武之泽 / 疾战 / 并进' },
]

const comparisonRows = [
  { source: '一类指挥：战必怯战、吕蒙白衣渡江', values: ['全部可移除', '不能移除', '不能移除', '不能移除', '不能抵御', '免疫怯战', '完全免疫', '本回合免疫怯战，状态保留'] },
  { source: '一类指挥：反计犹豫、S3 诸葛明虚其实', values: ['全部可移除', '不能移除', '不能移除', '不能移除', '不能抵御', '免疫犹豫', '完全免疫', '无效'] },
  { source: '二类指挥：妲己暴走', values: ['全部可移除', '不能移除', '不能移除', '不能移除', '概率抵御；挂上后无法解', '免疫混乱', '完全免疫', '无效'] },
  { source: '指挥 DOT：月英匠心、帝临回光', values: ['全部可移除', '不能移除', '不能移除', '不能移除', '不能抵御', '不管 DOT', '完全免疫', '无效'] },
  { source: '主动控制：浑水、妖术、当阳桥', values: ['全部可移除', '全部可移除', '全部可移除', '可移除', '概率抵御挂上', '免疫混乱', '无效', '只免疫怯战，无法免疫其他控制'] },
  { source: '主动 DOT：楚歌四起、焰焚箕轸、火烧连营、风声鹤唳等', values: ['全部可移除', '全部可移除', '全部可移除', '可移除', '概率抵御挂上', '不管 DOT', '无效', '无效'] },
  { source: '追击负面：怯心夺志、钝兵挫锐、斩铁、破阵强袭、方阵突击、盛气横凌、世仇', values: ['全部可移除', '全部可移除', '全部可移除', '可移除', '概率抵御挂上', '免疫 5 大硬控；不处理 DOT、降属性', '无效', '只免疫怯战，无法免疫其他控制'] },
]

const summaries = [
  '洞察只管 5 大硬控：怯战、犹豫、混乱、暴走、挑衅。不管 DOT、围困、降属性。',
  '主动镇静（九锡黄龙）只能清主动 / 追击来源负面；一类、二类指挥来源清不掉。',
  '被动镇静（郝昭不动如山）行动时移除全部有害效果，指挥 / 主动 / 追击来源均可清除。',
  '抵御只能阻止挂上；已经身上的 debuff，抵御无效。',
  '免疫 ≠ 清除：疾战、洞察的免疫，debuff 仍挂身上，只是本回合不生效。',
]

const cellClass = value => {
  if (value.includes('全部可移除') || value.includes('完全免疫')) return 'is-positive'
  if (value === '无效' || value.includes('不能')) return 'is-negative'
  return ''
}
</script>

<style scoped>
.status-guide-trigger{display:inline-flex}.dialog-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-right:28px}.dialog-heading h2{margin:0;color:#303133;font-size:20px;letter-spacing:0}.dialog-heading span{display:block;margin-top:4px;color:#909399;font-size:12px}.guide-content{color:#303133}.guide-content section+section{margin-top:24px}.guide-content h3{margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid #ebeef5;font-size:17px;letter-spacing:0}.guide-content h3 small{margin-left:8px;color:#d97706;font-size:12px;font-weight:500}.concept-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.concept-item,.status-item{border-left:3px solid #409eff;background:#f7f9fc;padding:10px 12px}.concept-item strong{font-size:14px}.concept-item p,.status-item p{margin:5px 0 0;color:#606266;font-size:13px;line-height:1.7}.status-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.status-name{display:flex;align-items:baseline;gap:8px}.status-name strong{font-size:14px}.status-name span{color:#909399;font-size:12px}.single-item{max-width:560px}.section-note{margin:0 0 12px;color:#606266;font-size:13px;line-height:1.7}.comparison-table-wrap{overflow-x:auto;border:1px solid #dcdfe6;border-radius:6px}.comparison-table{width:100%;min-width:1060px;table-layout:fixed;border-collapse:collapse;font-size:12px}.comparison-table th,.comparison-table td{padding:8px 7px;border-right:1px solid #ebeef5;border-bottom:1px solid #ebeef5;line-height:1.5;text-align:left;vertical-align:top;overflow-wrap:anywhere}.comparison-table thead th{position:sticky;top:0;background:#f2f6fc;color:#303133}.comparison-table thead th:first-child,.comparison-table tbody th{position:sticky;left:0;z-index:1;width:155px;background:#f8fafc}.comparison-table thead th:first-child{z-index:2}.comparison-table th:nth-child(6){width:88px}.comparison-table th:nth-child(7){width:105px}.comparison-table th:nth-child(9){width:112px}.comparison-table th small{display:block;margin-top:4px;color:#909399;font-weight:400}.comparison-table tr:last-child th,.comparison-table tr:last-child td{border-bottom:0}.comparison-table .is-positive{color:#16803c}.comparison-table .is-negative{color:#b42318}.summary-list{margin:0;padding-left:22px}.summary-list li{margin:8px 0;color:#4b5563;font-size:13px;line-height:1.7}
@media(max-width:700px){.concept-grid,.status-list{grid-template-columns:1fr}.dialog-heading{align-items:flex-start;gap:6px;padding-right:20px}.dialog-heading h2{font-size:17px}.dialog-heading :deep(.el-button){padding-left:6px;padding-right:6px}.guide-content section+section{margin-top:20px}}
</style>

<style>
.status-guide-dialog:not(.is-fullscreen){display:flex;flex-direction:column;max-height:82vh;margin-top:8vh}.status-guide-dialog:not(.is-fullscreen) .el-dialog__header{flex:none}.status-guide-dialog .el-dialog__body{min-height:0;overflow-y:auto;padding-top:12px}.status-guide-dialog:not(.is-fullscreen) .el-dialog__body{flex:1}.status-guide-dialog.is-fullscreen .el-dialog__body{max-height:calc(100vh - 72px)}
.status-guide-open .admin-main{overflow:hidden!important}
</style>
