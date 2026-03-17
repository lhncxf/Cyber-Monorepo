# 1. Update style/index.scss
cat << 'SCSS_EOF' > /Users/kobe/Documents/Cyber/Cyber-Mobile/src/style/index.scss
// 测试用的 iconfont，可生效
// @import './iconfont.css';

.test {
  // 可以通过 @apply 多个样式封装整体样式
  @apply mt-4 ml-4;

  padding-top: 4px;
  color: red;
}

:root,
page {
  --brand-primary: #1a1a1a;
  --brand-accent: #c0392b;
  --brand-bg: #fafaf8;
  --brand-surface: #ffffff;
  --brand-border: #f0ece6;
  --brand-text-primary: #1a1a1a;
  --brand-text-secondary: #6b6b6b;
  --brand-text-muted: #a0a0a0;
  
  --wot-color-theme: var(--brand-primary);
  background-color: var(--brand-bg);
}

// :not(not),
// ::before,
// ::after {
//   box-sizing: border-box; /* 1 */
//   border-width: 0; /* 2 */
//   border-style: solid; /* 2 */
//   border-color: var(--un-default-border-color, #e5e7eb); /* 3 */
// }
SCSS_EOF

# 2. Update uno.config.ts
sed -i '' "s/primary: 'var(--wot-color-theme,#0957DE)'/primary: 'var(--brand-primary,#1a1a1a)',\n      accent: 'var(--brand-accent,#c0392b)',\n      bg: 'var(--brand-bg,#fafaf8)',\n      surface: 'var(--brand-surface,#ffffff)',\n      border: 'var(--brand-border,#f0ece6)'/" /Users/kobe/Documents/Cyber/Cyber-Mobile/uno.config.ts

# 3. Update tabbar/config.ts
sed -i '' "s/selectedColor: '#018d71'/selectedColor: '#1a1a1a'/" /Users/kobe/Documents/Cyber/Cyber-Mobile/src/tabbar/config.ts
