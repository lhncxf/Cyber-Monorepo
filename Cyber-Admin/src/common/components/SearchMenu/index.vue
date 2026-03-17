<script lang="ts" setup>
import Modal from "./Modal.vue"

const visible = ref<boolean>(false)
const { t } = useI18n()

function handleOpen() {
  visible.value = true
}
</script>

<template>
  <div>
    <el-tooltip effect="dark" :content="t('searchMenu.placeholder')" placement="bottom">
      <SvgIcon name="search" @click="handleOpen" class="svg-icon" />
    </el-tooltip>
    <Modal v-model="visible" />
  </div>
</template>

<style lang="scss" scoped>
.svg-icon {
  font-size: 20px;
  &:focus {
    outline: none;
  }
}
</style>
