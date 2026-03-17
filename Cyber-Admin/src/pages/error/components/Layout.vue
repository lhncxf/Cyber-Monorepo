<script lang="ts" setup>
const { t } = useI18n()
</script>

<template>
  <div class="error">
    <div class="error-svg">
      <slot />
    </div>
    <router-link to="/">
      <el-button type="primary">
        {{ t("error.backHome") }}
      </el-button>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.error {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &-svg {
    width: 400px;
    margin-bottom: 50px;
  }
}
</style>
