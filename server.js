require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// ✅ 安全 CORS（上线记得换域名）
app.use(cors({
    origin: "http://localhost:5500"
}));

app.use(express.json());

// ✅ 正确读取 key
const API_KEY = process.env.API_KEY;
const API_URL = "https://api.deepseek.com/chat/completions";

// ✅ 简单限流（防刷）
let requestCount = 0;
setInterval(() => requestCount = 0, 60000); // 每分钟重置

app.post('/chat', async (req, res) => {
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

app.listen(3000, () => {
    console.log("🚀 Server running: http://localhost:3000");
});