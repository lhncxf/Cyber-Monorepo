<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { navigateToInterceptor } from '@/router/interceptor'

onShow((options) => {
  // 处理直接进入页面路由的情况：如h5直接输入路由、微信小程序分享后进入等
  if (options?.path) {
    navigateToInterceptor.invoke({
      url: `/${options.path}`,
      query: options.query,
    })
  }
  else {
    navigateToInterceptor.invoke({ url: '/' })
  }
})
</script>

<style lang="scss"></style>
