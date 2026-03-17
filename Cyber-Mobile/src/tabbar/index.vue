<script setup lang="ts">
// i-carbon-code
import { customTabbarEnable, needHideNativeTabbar, tabbarCacheEnable } from './config'
import { isPageTabbar, tabbarList, tabbarStore } from './store'
import TabbarItem from './TabbarItem.vue'

// #ifdef MP-WEIXIN
// 将自定义节点设置成虚拟的（去掉自定义组件包裹层），更加接近Vue组件的表现，能更好的使用flex属性
defineOptions({
  virtualHost: true,
})
// #endif

// 当前页面是否是 tabbar 页面
const isTabbarPage = ref(false)

function updateTabbarPageState() {
  const pages = getCurrentPages()
  if (pages.length === 0)
    return
  const current = pages.at(-1)
  const path = current.route ? (current.route.startsWith('/') ? current.route : `/${current.route}`) : '/'
  isTabbarPage.value = isPageTabbar(path)
  tabbarStore.setAutoCurIdx(path)
}

/**
 * 中间的鼓包tabbarItem的点击事件
 */
function handleClickBulge() {
  uni.showToast({
    title: '点击了中间的鼓包tabbarItem',
    icon: 'none',
  })
}

function handleClick(index: number) {
  // 点击原来的不做操作
  if (index === tabbarStore.curIdx) {
    return
  }
  const list = tabbarList.value
  if (!list[index]) {
    return
  }
  if (list[index].isBulge) {
    handleClickBulge()
    return
  }
  const url = list[index].pagePath
  tabbarStore.setCurIdx(index)
  if (tabbarCacheEnable) {
    uni.switchTab({ url })
  }
  else {
    uni.navigateTo({ url })
  }
}
// #ifndef MP-WEIXIN || MP-ALIPAY
// 因为有了 custom:true， 微信里面不需要多余的hide操作
onLoad(() => {
  // 解决原生 tabBar 未隐藏导致有2个 tabBar 的问题
  needHideNativeTabbar
  && uni.hideTabBar({
    fail() {},
    success() {},
  })
  updateTabbarPageState()
})
// #endif

onShow(() => {
  updateTabbarPageState()
})

// #ifdef MP-ALIPAY
onMounted(() => {
  // 解决支付宝自定义tabbar 未隐藏导致有2个 tabBar 的问题; 注意支付宝很特别，需要在 onMounted 钩子调用
  customTabbarEnable
  && uni.hideTabBar({
    fail() {},
    success() {},
  })
})
// #endif
const activeColor = 'var(--brand-primary, #1a1a1a)'
const inactiveColor = 'var(--brand-text-muted, #a0a0a0)'
function getColorByIndex(index: number) {
  return tabbarStore.curIdx === index ? activeColor : inactiveColor
}
</script>

<template>
  <view v-if="customTabbarEnable && isTabbarPage" class="h-50px pb-safe">
    <view class="border-and-fixed bg-[var(--brand-surface)]/90 backdrop-blur-md" @touchmove.stop.prevent>
      <view class="h-50px flex items-center">
        <view
          v-for="(item, index) in tabbarList" :key="index"
          class="flex flex-1 flex-col items-center justify-center transition-all duration-300"
          :class="tabbarStore.curIdx === index ? 'opacity-100 scale-110' : 'opacity-60 scale-100'"
          :style="{ color: getColorByIndex(index) }"
          @click="handleClick(index)"
        >
          <view v-if="item.isBulge" class="relative">
            <!-- 中间一个鼓包tabbarItem的处理 -->
            <view class="bulge border-[var(--brand-border)]">
              <TabbarItem :item="item" :index="index" class="text-center" is-bulge />
            </view>
          </view>
          <TabbarItem v-else :item="item" :index="index" class="relative px-3 text-center" />
        </view>
      </view>

      <view class="pb-safe" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.border-and-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  box-sizing: border-box;
}
// 中间鼓包的样式
.bulge {
  position: absolute;
  top: -20px;
  left: 50%;
  transform-origin: top center;
  transform: translateX(-50%) scale(0.5) translateY(-33%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 250rpx;
  height: 250rpx;
  border-radius: 50%;
  background-color: var(--brand-surface);
  box-shadow:
    inset 0 0 0 1px var(--brand-border),
    0 -4px 10px rgba(0, 0, 0, 0.05);

  &:active {
    // opacity: 0.8;
  }
}
</style>
