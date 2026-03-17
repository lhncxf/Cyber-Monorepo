<script lang="ts" setup>
import type { NotifyItem } from "./type"
import { Bell } from "@element-plus/icons-vue"
import { messageData, notifyData, todoData } from "./data"
import List from "./List.vue"

type TabKey = "notifyTab" | "messageTab" | "todoTab"

interface DataItem {
  key: TabKey
  type: "primary" | "success" | "warning" | "danger" | "info"
  list: NotifyItem[]
}

const { t } = useI18n()

const badgeValue = computed(() => data.value.reduce((sum, item) => sum + item.list.length, 0))

const badgeMax = 99

const popoverWidth = 350

const activeName = ref<TabKey>("notifyTab")

const data = ref<DataItem[]>([
  { key: "notifyTab", type: "primary", list: notifyData },
  { key: "messageTab", type: "danger", list: messageData },
  { key: "todoTab", type: "warning", list: todoData }
])

function handleHistory() {
  ElMessage.success(t("notify.viewHistory", { name: t(`notify.${activeName.value}`) }))
}
</script>

<template>
  <div class="notify">
    <el-popover placement="bottom" :width="popoverWidth" trigger="click">
      <template #reference>
        <el-badge :value="badgeValue" :max="badgeMax" :hidden="badgeValue === 0">
          <el-tooltip effect="dark" :content="t('notify.title')" placement="bottom">
            <el-icon :size="20">
              <Bell />
            </el-icon>
          </el-tooltip>
        </el-badge>
      </template>
      <template #default>
        <el-tabs v-model="activeName" class="demo-tabs" stretch>
          <el-tab-pane v-for="(item, index) in data" :key="index" :name="item.key">
            <template #label>
              {{ t(`notify.${item.key}`) }}
              <el-badge :value="item.list.length" :max="badgeMax" :type="item.type" />
            </template>
            <el-scrollbar height="400px">
              <List :data="item.list" />
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
        <div class="notify-history">
          <el-button link @click="handleHistory">
            {{ t("notify.viewHistory", { name: t(`notify.${activeName}`) }) }}
          </el-button>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<style lang="scss" scoped>
.notify-history {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color);
}
</style>
