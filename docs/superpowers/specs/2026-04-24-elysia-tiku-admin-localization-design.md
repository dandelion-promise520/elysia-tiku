# Elysia Tiku 管理面板界面汉化设计

## 1. 概述
当前 Elysia Tiku 管理面板的界面语言主要为带有极客风格的英文标签（如 `SYS.CONFIG`, `AUTH.ROOT_PASSWORD`）。本次设计的目的是将整个前端界面的文本转换为常规的现代 SaaS 风格中文。这不仅包括主导航和侧边栏，还涵盖所有面板的表单标签、占位符、按钮文字、工具提示以及操作指南，旨在提供更自然、易读的用户体验。

## 2. 界面翻译规范
采用现代 SaaS 面板的标准中文词汇，摒弃原有的“系统代码”前缀风格。

### 2.1 全局布局与导航 (App.tsx)
*   **侧边栏菜单：**
    *   `Configuration` ➔ `系统设置`
    *   `OCS Generator` ➔ `题库配置生成`
    *   `Debug & Test` ➔ `测试与调试`
    *   `System Logs` ➔ `系统运行日志`
*   **系统状态区域：**
    *   `ONLINE` / `OFFLINE` ➔ `运行中` / `已离线`
    *   `MEM` ➔ `内存使用`
    *   `CTX` ➔ `当前模型`
    *   `Logout` ➔ `退出登录`
*   **全局提示 (Toasts)：**
    *   `Configuration saved successfully` ➔ `系统配置保存成功`

### 2.2 登录界面 (LoginPanel.tsx)
*   **标题与描述：** 
    *   `AUTH.SYS` ➔ `系统身份验证`
    *   `Administrator access required` ➔ `需要管理员权限才能访问系统`
*   **输入框与按钮：**
    *   `ENTER_PASSWORD` ➔ `请输入管理员密码`
    *   `INITIATE.LOGIN` ➔ `登录系统`
    *   `VERIFYING...` ➔ `验证中...`
*   **错误信息：**
    *   `ERR_AUTH: INVALID_PASSWORD` ➔ `身份验证失败：密码错误`
    *   `ERR_NET: UNABLE_TO_CONNECT` ➔ `网络错误：无法连接到服务器`

### 2.3 系统设置 (ConfigPanel.tsx)
*   **标题与描述：**
    *   `SYS.CONFIG` ➔ `引擎参数配置`
    *   `AI Engine Parameters & Security` ➔ `配置大模型接口与系统安全选项`
*   **表单项：**
    *   `API.BASE_URL` ➔ `API 接口地址`
    *   `API.KEY` ➔ `API 密钥`
    *   `AI.MODEL` ➔ `AI 模型名称`
    *   `PARAM.TEMP` ➔ `输出随机性 (Temperature)`
    *   `MAX_TOKENS` ➔ `最大输出长度 (Max Tokens)`
    *   `TIMEOUT_MS` ➔ `请求超时时间 (毫秒)`
*   **开关项：**
    *   `DEBUG.DEFAULT_OUTPUT` ➔ `默认返回调试输出` (描述：在所有请求中直接返回 AI 的原始字符串输出，忽略结构化格式)
    *   `SYS.LOG_DEBUG` ➔ `启用系统详细日志` (描述：在服务器终端开启详细的调试日志打印)
*   **安全设置：**
    *   `AUTH.ROOT_PASSWORD` ➔ `管理员系统密码`
    *   `WARNING: Leaves system unprotected if empty.` ➔ `警告：如果留空，任何人都可以访问此管理面板。`
    *   `[KEY_SET_ENTER_NEW_TO_OVERWRITE]` ➔ `[已设置，输入新密钥以覆盖]`
    *   `[ENTER_NEW_API_KEY]` ➔ `[请输入 API 密钥]`
    *   `[PWD_SET_ENTER_NEW_TO_OVERWRITE]` ➔ `[已设置，输入新密码以覆盖]`
    *   `[NO_PASSWORD_SET]` ➔ `[未设置密码]`
*   **保存按钮：**
    *   `SAVE.CONFIG` ➔ `保存配置`
    *   `WRITING_TO_DISK...` ➔ `正在保存...`
    *   `ERR_SAVE: CONFIG_UPDATE_FAILED` ➔ `保存失败：无法更新系统配置`

### 2.4 题库配置生成 (OcsPanel.tsx)
*   **标题与描述：**
    *   `OCS_GEN` ➔ `OCS 题库配置生成器`
    *   `Generate JSON config for OCS Extension` ➔ `生成用于 OCS 浏览器扩展的 JSON 配置文件`
*   **输入与展示：**
    *   `TARGET_SERVER_URL` ➔ `目标服务器地址`
    *   `URL of the Elysia Tiku backend service` ➔ `Elysia Tiku 后端服务的访问地址`
    *   `GENERATED_PAYLOAD` ➔ `生成的 JSON 配置代码`
*   **操作按钮：**
    *   `COPY_JSON` ➔ `复制 JSON`
    *   `COPIED` ➔ `已复制`
    *   `EXEC.COPY_CONFIG` ➔ `复制完整配置代码`
*   **指南与提示：**
    *   `QUICK_START.MANUAL` ➔ `快速使用指南`
    *   步骤1：`Ensure backend service is running and accessible (use localhost:300 for local dev).` ➔ `请确保后端服务正在运行且可访问（本地开发请使用 localhost:300）。`
    *   步骤2：`Input server URL above, JSON payload updates automatically.` ➔ `在上方输入服务器地址，下方的 JSON 配置代码会自动更新。`
    *   步骤3：`Execute COPY and paste into OCS Extension settings.` ➔ `点击复制按钮，并将代码粘贴到 OCS 扩展的自定义题库设置中。`
    *   `HTTPS_WARNING` ➔ `HTTPS 混合内容警告`
    *   `Mixed content blocked if OCS domain is HTTPS but backend is HTTP without reverse proxy.` ➔ `如果 OCS 答题页面是 HTTPS 协议，而后端服务是 HTTP 协议且没有反向代理，浏览器会拦截请求。`
    *   `SYS.MSG: JSON Copied` ➔ `系统消息：JSON 配置已复制到剪贴板`
    *   `ERR_COPY: CLIPBOARD_DENIED` ➔ `复制失败：剪贴板权限被拒绝`

### 2.5 测试与调试 (TesterPanel.tsx)
*   **标题与描述：**
    *   `DEBUG.TEST` ➔ `大模型请求测试`
    *   `Execute prompt validation against AI engine` ➔ `直接调用 AI 引擎，验证提示词与参数配置是否正确`
*   **表单项：**
    *   `PAYLOAD_TITLE` ➔ `测试题目内容`
    *   `[INPUT_QUESTION_TEXT_HERE]` ➔ `[在此输入测试题目文本]`
    *   `DATA_TYPE` ➔ `题目类型`
    *   `SELECT_TYPE` ➔ `选择题目类型`
    *   `OPTIONS_ARRAY (LINE_SEPARATED)` ➔ `候选项列表 (每行填写一个选项)`
    *   下拉菜单项：`SINGLE_CHOICE` ➔ `单选题`, `MULTIPLE_CHOICE` ➔ `多选题`, `JUDGEMENT` ➔ `判断题`, `COMPLETION` ➔ `填空题`
*   **操作按钮：**
    *   `INJECT_DUMMY_DATA` ➔ `填入测试用例`
    *   `EXECUTE_CALL` ➔ `发送验证请求`
    *   `PROCESSING...` ➔ `请求处理中...`
*   **结果展示：**
    *   `SYS.RESPONSE: SUCCESS` ➔ `系统响应：测试成功`
    *   `SYS.RESPONSE: FAILED` ➔ `系统响应：测试失败`
    *   `COMPUTED_OUTPUT` ➔ `AI 计算结果`
    *   `CONFIDENCE_SCORE` ➔ `置信度评分`
    *   `TRACE_LOG` ➔ `执行追踪日志`
    *   `ERR_NET: BACKEND_UNREACHABLE` ➔ `网络错误：无法连接到后端服务`
    *   `UNKNOWN_ERROR_OCCURRED` ➔ `发生未知错误`
    *   测试用例示例修改为中文：`Which of the following methods...` ➔ `下列哪个方法可以向 JavaScript 数组的末尾添加一个或多个元素？`；选项变为 `A. pop()`, `B. push()`, `C. shift()`, `D. unshift()`

### 2.6 系统日志 (LogsPanel.tsx)
*   **标题与描述：**
    *   `SYS.LOGS` ➔ `系统运行日志`
    *   `System operation history and transaction logs` ➔ `查看系统操作历史、错误信息及请求事务日志`
*   **操作按钮：**
    *   `SYNC` ➔ `刷新日志`
*   **列表展示：**
    *   `NO_LOG_ENTRIES_FOUND` ➔ `暂无日志记录`
    *   `DATA_PAYLOAD` ➔ `请求载荷数据`
    *   `ERR_NET: UNABLE_TO_FETCH_LOGS` ➔ `网络错误：无法获取系统日志`

## 3. 实施策略
*   逐个编辑 `src/components/` 下的组件和 `App.tsx`，将上述对应的英文字符串替换为中文字符串。
*   确保不破坏任何逻辑绑定（如 `config.aiApiKey` 等属性名称和内部枚举值 `single`, `multiple` 不变，仅更改展示标签）。
