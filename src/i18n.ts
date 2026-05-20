// iAGS 2.0 — vue-i18n 多语言配置
// 当前使用中文简体，后续从 iAGS MultiLang 词条迁移

import { createI18n } from 'vue-i18n'
import zhCN from '@/locales/zh-CN.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
  },
})
