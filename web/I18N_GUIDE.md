# 🌍 Eagle Chat 多语言支持指南

## 📋 支持的语言

Eagle Chat 支持以下10种语言：

1. **中文 (zh)** 🇨🇳 - 完整翻译
2. **English (en)** 🇺🇸 - 完整翻译
3. **Español (es)** 🇪🇸 - 西班牙语
4. **Français (fr)** 🇫🇷 - 法语
5. **Deutsch (de)** 🇩🇪 - 德语
6. **日本語 (ja)** 🇯🇵 - 日语
7. **한국어 (ko)** 🇰🇷 - 韩语
8. **Русский (ru)** 🇷🇺 - 俄语
9. **العربية (ar)** 🇸🇦 - 阿拉伯语
10. **Português (pt)** 🇧🇷 - 葡萄牙语

## 🎯 功能特性

### 自动语言检测
- 自动检测浏览器语言
- 记住用户选择的语言（localStorage）
- 支持手动切换语言

### 完整翻译覆盖
- ✅ 所有UI文本
- ✅ 错误提示信息
- ✅ 成功提示信息
- ✅ 验证消息
- ✅ 确认对话框
- ✅ 时间格式
- ✅ 按钮和标签

## 📁 文件结构

```
web/src/
├── i18n/
│   ├── index.js                 # i18n配置
│   └── locales/
│       ├── zh.json              # 中文（完整）
│       ├── en.json              # 英文（完整）
│       ├── es.json              # 西班牙语
│       ├── fr.json              # 法语
│       ├── de.json              # 德语
│       ├── ja.json              # 日语
│       ├── ko.json              # 韩语
│       ├── ru.json              # 俄语
│       ├── ar.json              # 阿拉伯语
│       └── pt.json              # 葡萄牙语
└── components/
    └── LanguageSwitcher.jsx     # 语言切换组件
```

## 🔧 使用方法

### 在组件中使用翻译

```jsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('login.title')}</p>
      <button>{t('common.confirm')}</button>
    </div>
  )
}
```

### 带参数的翻译

```jsx
// 在语言文件中
{
  "validation": {
    "minLength": "最少需要 {{min}} 个字符"
  }
}

// 在组件中使用
{t('validation.minLength', { min: 6 })}
```

### 切换语言

```jsx
import { useTranslation } from 'react-i18next'

function LanguageButton() {
  const { i18n } = useTranslation()
  
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
  }
  
  return (
    <button onClick={() => changeLanguage('zh')}>
      中文
    </button>
  )
}
```

### 使用语言切换组件

```jsx
import LanguageSwitcher from '../components/LanguageSwitcher'

function Header() {
  return (
    <div>
      <LanguageSwitcher />
    </div>
  )
}
```

## 📝 翻译键结构

### app - 应用信息
```json
{
  "app": {
    "name": "Eagle Chat",
    "tagline": "基于钱包地址的去中心化聊天",
    "version": "v1.0",
    "poweredBy": "由 Web3 驱动"
  }
}
```

### common - 通用文本
```json
{
  "common": {
    "loading": "加载中...",
    "success": "成功",
    "error": "错误",
    "confirm": "确认",
    "cancel": "取消",
    ...
  }
}
```

### login - 登录页面
```json
{
  "login": {
    "title": "欢迎使用 Eagle Chat",
    "connectWallet": "使用 MetaMask 登录",
    "features": { ... },
    "steps": { ... }
  }
}
```

### chat - 聊天界面
```json
{
  "chat": {
    "tabs": { ... },
    "welcome": { ... },
    "empty": { ... },
    "input": { ... },
    "message": { ... }
  }
}
```

### errors - 错误提示
```json
{
  "errors": {
    "network": "网络错误，请检查您的连接",
    "loginFailed": "登录失败，请重试",
    "walletNotInstalled": "请先安装 MetaMask 钱包",
    ...
  }
}
```

### success - 成功提示
```json
{
  "success": {
    "loginSuccess": "登录成功！",
    "messageSent": "消息已发送",
    ...
  }
}
```

## 🌐 添加新语言

### 1. 创建语言文件

在 `web/src/i18n/locales/` 目录下创建新的语言文件，例如 `it.json`（意大利语）：

```json
{
  "app": {
    "name": "Eagle Chat",
    "tagline": "Chat Decentralizzata Basata su Indirizzo Wallet"
  },
  "common": {
    "loading": "Caricamento...",
    "success": "Successo",
    ...
  }
}
```

### 2. 在 i18n 配置中注册

编辑 `web/src/i18n/index.js`：

```javascript
import it from './locales/it.json'

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  it: { translation: it },  // 添加新语言
  ...
}
```

### 3. 在语言切换器中添加

编辑 `web/src/components/LanguageSwitcher.jsx`：

```javascript
const languages = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },  // 添加新语言
  ...
]
```

## 🔍 翻译完整性检查

### 中文和英文
- ✅ 完整翻译（所有键）
- ✅ 包含所有功能模块
- ✅ 包含所有错误和成功消息

### 其他语言
- ⚠️ 基础翻译（主要功能）
- 📝 需要补充完整翻译

## 🚀 最佳实践

### 1. 使用命名空间
```javascript
// 好的做法
t('login.title')
t('chat.welcome.title')
t('errors.network')

// 避免
t('title')
t('error')
```

### 2. 保持键名一致
```javascript
// 所有语言文件使用相同的键名
{
  "common": {
    "loading": "Loading..."  // en
    "loading": "加载中..."   // zh
    "loading": "Cargando..." // es
  }
}
```

### 3. 使用变量替换
```javascript
// 语言文件
{
  "welcome": "欢迎, {{name}}!"
}

// 组件中
{t('welcome', { name: user.name })}
```

### 4. 处理复数
```javascript
// 语言文件
{
  "messages": {
    "one": "{{count}} 条消息",
    "other": "{{count}} 条消息"
  }
}

// 组件中
{t('messages', { count: 5 })}
```

## 📊 翻译进度

| 语言 | 进度 | 状态 |
|------|------|------|
| 中文 (zh) | 100% | ✅ 完成 |
| English (en) | 100% | ✅ 完成 |
| Español (es) | 30% | ⏳ 进行中 |
| Français (fr) | 30% | ⏳ 进行中 |
| Deutsch (de) | 20% | ⏳ 进行中 |
| 日本語 (ja) | 30% | ⏳ 进行中 |
| 한국어 (ko) | 30% | ⏳ 进行中 |
| Русский (ru) | 20% | ⏳ 进行中 |
| العربية (ar) | 20% | ⏳ 进行中 |
| Português (pt) | 20% | ⏳ 进行中 |

## 🤝 贡献翻译

欢迎贡献翻译！请按照以下步骤：

1. Fork 项目
2. 创建新分支：`git checkout -b add-translation-xx`
3. 编辑语言文件：`web/src/i18n/locales/xx.json`
4. 提交更改：`git commit -m "Add XX translation"`
5. 推送分支：`git push origin add-translation-xx`
6. 创建 Pull Request

## 📞 联系方式

如有翻译问题或建议，请：
- 提交 Issue
- 发送 Pull Request
- 联系项目维护者

---

**感谢您使用 Eagle Chat！** 🦅
