require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// ✅ 安全 CORS配置（开发+生产）
app.use(cors({
    origin: function (origin, callback) {
        // 允许没有origin的请求（如curl、Postman）
        if (!origin) return callback(null, true);

        // 从环境变量获取允许的域名（可选）
        const envAllowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : [];

        // 允许的域名列表（硬编码 + 环境变量）
        const allowedOrigins = [
            // 本地开发环境
            "http://localhost:5500",    // Live Server默认端口
            "http://localhost:8080",    // 常见开发端口
            "http://localhost:3000",    // React/Vue开发服务器
            "http://localhost:3001",    // 备用端口
            "http://127.0.0.1:5500",    // IPv4地址
            "http://127.0.0.1:8080",
            "http://127.0.0.1:3000",
            // 生产环境 - Vercel前端
            "https://dchat-gamma.vercel.app",
            // 从环境变量添加的域名
            ...envAllowedOrigins
        ];

        // 去重
        const uniqueOrigins = [...new Set(allowedOrigins.filter(Boolean))];

        console.log(`🌐 CORS检查: origin=${origin}, 允许的域名:`, uniqueOrigins);

        if (uniqueOrigins.includes(origin)) {
            console.log(`✅ CORS允许: ${origin}`);
            return callback(null, true);
        }

        // 对于开发环境，允许所有本地请求（仅开发时使用）
        if (process.env.NODE_ENV !== 'production' &&
            (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
            console.log(`⚠️ 开发环境允许本地请求: ${origin}`);
            return callback(null, true);
        }

        console.log(`❌ CORS拒绝: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    }
}));

app.use(express.json());

// ✅ 正确读取 key
const API_KEY = process.env.API_KEY;
const API_URL = "https://api.deepseek.com/chat/completions";

// ✅ 简单限流（防刷）
let requestCount = 0;
setInterval(() => requestCount = 0, 60000); // 每分钟重置

app.post('/chat', async (req, res) => {
    // 注意：CORS中间件已在第9-14行配置，此处无需重复检查
    // 保留限流和API逻辑，移除重复的来源检查

    // 限流逻辑（基于 IP）
    const ip = req.ip;
    if (!global.rateLimit) global.rateLimit = {};

    if (!global.rateLimit[ip]) {
        global.rateLimit[ip] = { count: 0, time: Date.now() };
    }

    const now = Date.now();

    // 如果上一分钟的时间已经过去，重置计数
    if (now - global.rateLimit[ip].time > 60000) {
        global.rateLimit[ip] = { count: 0, time: now };
    }

    // 如果该 IP 访问超过 30 次，返回 429 错误
    if (global.rateLimit[ip].count > 30) {
        return res.status(429).json({ error: "请求过多，请稍后再试" });
    }

    // 计数增加
    global.rateLimit[ip].count++;

    try {
        // 🚫 限流
        if (requestCount > 60) {
            return res.status(429).json({ error: "请求过多，请稍后再试" });
        }
        requestCount++;

        const { messages } = req.body;

        // ✅ 数据校验
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "messages 格式错误" });
        }

        if (messages.length > 20) {
            return res.status(400).json({ error: "消息过多" });
        }

        console.log("🟡 请求 DeepSeek...");

        const response = await axios.post(API_URL, {
            model: "deepseek-chat",
            messages,
            temperature: 0.8
        }, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            timeout: 15000
        });

        console.log("🟢 成功返回");

        // ✅ 只返回必要数据（安全）
        res.json({
            choices: response.data.choices
        });

    } catch (error) {
        console.error("🔴 后端错误：", error.response?.data || error.message);

        // ✅ 错误分类
        if (error.response?.status === 401) {
            return res.status(401).json({ error: "API Key 无效" });
        }

        if (error.response?.status === 402) {
            return res.status(402).json({ error: "余额不足" });
        }

        if (error.code === "ECONNABORTED") {
            return res.status(408).json({ error: "请求超时" });
        }

        res.status(500).json({ error: "服务器异常" });
    }
});

// 健康检查端点
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        port: PORT,
        corsAllowedOrigins: ["http://localhost:5500", "https://dchat-gamma.vercel.app"]
    });
});

// 根路径重定向或信息
app.get('/', (_req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>3D柴犬AI聊天服务器</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .container { max-width: 800px; margin: 0 auto; }
                .status { background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .error { background: #ffe8e8; padding: 20px; border-radius: 5px; }
                code { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 3D柴犬AI聊天服务器</h1>
                <div class="status">
                    <h2>✅ 服务器运行正常</h2>
                    <p>端口: <code>${PORT}</code></p>
                    <p>API端点: <code>POST /chat</code></p>
                    <p>健康检查: <code>GET /health</code></p>
                </div>
                <h2>使用说明</h2>
                <ul>
                    <li>前端请打开 <code>index.html</code> 文件</li>
                    <li>确保使用 Live Server (端口5500) 或兼容的静态服务器</li>
                    <li>聊天API需要有效的DeepSeek API密钥</li>
                </ul>
                <h2>快速测试</h2>
                <pre><code>curl -X POST http://localhost:${PORT}/chat \\
  -H "Content-Type: application/json" \\
  -H "Origin: http://localhost:5500" \\
  -d '{"messages":[{"role":"user","content":"Hello"}]}'</code></pre>
            </div>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
    console.log("📊 健康检查: http://localhost:" + PORT + "/health");
    console.log("🏠 首页: http://localhost:" + PORT);
});