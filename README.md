# 3D柴犬AI聊天应用

一个包含Three.js 3D粒子效果和DeepSeek AI集成的全栈聊天应用。

## 功能特色
- 3D粒子背景和柴犬模型动画
- 集成DeepSeek AI智能对话
- 语音合成(TTS)功能
- 可自定义AI角色性格
- 本地存储聊天历史

## 项目结构
```
├── index.html          # 前端主页面
├── script.js           # 前端逻辑(3D动画+聊天)
├── style.css           # 样式文件
├── server.js           # 后端Express服务器
├── package.json        # 项目配置
├── .env                # 环境变量(API密钥)
├── shiba_dog.glb       # 3D柴犬模型
└── start.bat           # Windows启动脚本
```

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置API密钥
确保 `.env` 文件包含有效的DeepSeek API密钥：
```
API_KEY=sk-your-deepseek-api-key-here
```

### 3. 启动后端服务器
**方法A: 使用启动脚本 (推荐)**
- 双击 `start.bat` (Windows)
- 或命令行运行: `node server.js`

**方法B: 使用npm脚本**
```bash
npm start      # 启动服务器
# 或
npm run dev    # 使用nodemon热重载(需安装nodemon)
```

服务器启动后会在 `http://localhost:3000` 运行。

### 4. 启动前端
**方法A: 使用Live Server (VSCode扩展)**
- 在VSCode中打开 `index.html`
- 右键选择 "Open with Live Server"
- 前端将在 `http://localhost:5500` 运行

**方法B: 直接打开文件**
- 双击 `index.html` (某些浏览器可能限制API请求)

### 5. 开始使用
1. 确保后端服务器正在运行
2. 打开前端页面
3. 在输入框中发送消息
4. 等待柴犬AI回复

## 故障排除

### 常见问题

#### 1. "连接被拒绝" 错误
- **问题**: `POST http://localhost:3000/chat net::ERR_CONNECTION_REFUSED`
- **原因**: 后端服务器未运行
- **解决**: 启动 `server.js` (见步骤3)

#### 2. CORS错误
- **问题**: 跨域请求被阻止
- **原因**: 前端和后端端口不同
- **解决**: 已配置CORS，确保服务器允许前端端口

#### 3. 3D模型加载缓慢
- **原因**: `shiba_dog.glb` 文件较大(25MB)
- **解决**: 耐心等待或使用更小的模型文件

#### 4. API密钥无效
- **问题**: 服务器返回401错误
- **解决**: 检查 `.env` 文件中的API_KEY是否有效

### 测试服务器是否运行
```bash
# 检查端口3000
curl -I http://localhost:3000/chat

# 测试API端点
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}]}"
```

## 部署说明

### 全栈部署架构
```
用户浏览器 → Vercel前端(静态文件) → Render后端(Node.js) → DeepSeek API
```

### 前端部署 (Vercel)
1. 将前端文件上传到Vercel
2. 访问地址: `https://dchat-gamma.vercel.app`
3. **重要**: 配置 `script.js` 中的 `API_CONFIG.production` 指向Render后端

### 后端部署 (Render)
#### 步骤1: 部署到Render
1. 在 [render.com](https://render.com) 创建新Web Service
2. 连接GitHub仓库
3. 配置设置:
   - **名称**: `dchat-backend` (或自定义)
   - **环境**: Node
   - **构建命令**: `npm install`
   - **启动命令**: `npm start`
   - **实例类型**: Free (或根据需要升级)

#### 步骤2: 配置环境变量
在Render Dashboard中添加环境变量:
- `API_KEY`: 您的DeepSeek API密钥
- `NODE_ENV`: `production` (可选)
- `ALLOWED_ORIGINS`: `https://dchat-gamma.vercel.app` (可选，多个用逗号分隔)

#### 步骤3: 获取Render后端网址
部署完成后，Render会提供类似 `https://dchat-backend.onrender.com` 的URL

### 前端配置修改
部署Render后，**必须修改前端配置**:

1. 打开 `script.js` 文件
2. 找到 `API_CONFIG` 对象 (约第15行)
3. 修改 `production` 值为您的Render后端网址:
   ```javascript
   const API_CONFIG = {
       development: 'http://localhost:3000',
       production: 'https://tc-tqaf.onrender.com'  // ← 用户的实际Render网址
   };
   ```

4. 重新部署前端到Vercel

### 环境配置
- **开发环境**: API自动指向 `http://localhost:3000` (本地)
- **生产环境**: API自动指向您的Render后端网址

### 验证部署
1. **测试后端**: 访问 `https://tc-tqaf.onrender.com/health` 应返回JSON
2. **测试API**: 
   ```bash
   curl -X POST https://tc-tqaf.onrender.com/chat \
     -H "Content-Type: application/json" \
     -H "Origin: https://dchat-gamma.vercel.app" \
     -d '{"messages":[{"role":"user","content":"测试"}]}'
   ```
3. **测试前端**: 访问Vercel前端，发送消息测试

## 技术栈
- **前端**: HTML5, CSS3, JavaScript, Three.js
- **后端**: Node.js, Express, Axios
- **AI服务**: DeepSeek API
- **3D图形**: Three.js r128, GLTFLoader

## 文件说明
- `script.js`: 包含3D动画和聊天逻辑
- `server.js`: Express服务器，处理AI API请求
- `start.bat`: Windows启动脚本
- `.env`: 环境变量(不要提交到Git)

## 注意事项
1. 保持 `.env` 文件安全，不要提交到版本控制
2. 生产环境需要配置正确的CORS来源
3. 3D模型文件较大，建议优化加载
4. API调用可能受DeepSeek服务限制

## 更新日志
- 2026-04-05: 修复CORS配置和API_BASE问题，增强错误处理