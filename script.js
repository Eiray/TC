/**
 * ==========================================
 * 1. 环境与 API 配置 (请勿修改跨域逻辑)
 * ==========================================
 */
const API_CONFIG = {
    development: 'http://localhost:3000',
    production: 'https://tc-tqaf.onrender.com'
};

const getAPIBase = () => {
    const hostname = window.location.hostname;

    // 本地开发环境
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return API_CONFIG.development;
    }

    // 自定义域名环境 - 使用生产API
    if (hostname === 'www.tcyx.love' || hostname === 'tcyx.love') {
        return API_CONFIG.production;
    }

    // 其他情况（如Vercel部署）也使用生产API
    return API_CONFIG.production;
};

const API_BASE = getAPIBase();
console.log("🚀 环境初始化:", { hostname: window.location.hostname, API_BASE });

/**
 * ==========================================
 * 2. 3D 场景初始化 (Three.js)
 * ==========================================
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('particleCanvas'),
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 5);

// 粒子背景
const bgGeometry = new THREE.BufferGeometry();
const bgCount = 3000;
const bgPos = new Float32Array(bgCount * 3);
for(let i=0; i<bgCount*3; i++) bgPos[i] = (Math.random() - 0.5) * 20;
bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
const bgSystem = new THREE.Points(bgGeometry, new THREE.PointsMaterial({ size: 0.015, color: 0xffffff, transparent: true, opacity: 0.3 }));
scene.add(bgSystem);

// 灯光
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(1, 1, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

// 加载模型
let dogModel, distortion = 0;
const loader = new THREE.GLTFLoader();
loader.load('shiba_dog.glb', (gltf) => {
    dogModel = gltf.scene;
    dogModel.scale.set(0.5, 0.5, 0.5);
    scene.add(dogModel);
    console.log("✅ 模型就绪");
});

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.002;
    if (bgSystem) bgSystem.rotation.y += 0.0002;
    if (dogModel) {
        dogModel.rotation.y += 0.005;
        let s = 0.5 + Math.sin(time) * 0.01 + distortion;
        dogModel.scale.set(s, s, s);
        dogModel.position.y = 1 + Math.sin(time * 0.5) * 0.1;
        dogModel.rotation.z = Math.sin(time * 15) * distortion * 2;
        distortion *= 0.92;
    }
    renderer.render(scene, camera);
}
animate();

/**
 * ==========================================
 * 3. 核心交互逻辑 (精确 3D 点击)
 * ==========================================
 */
// 只在点击 3D 画布时触发模型动画
renderer.domElement.addEventListener('click', (event) => {
    event.stopPropagation();
    // 触发模型动效 (只触发动画，不触发语音)
    distortion = 0.15;
    console.log("🐶 模型被点击，触发动画效果");
});

// 窗口自适应
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/**
 * ==========================================
 * 4. 语音与 AI 对话系统
 * ==========================================
 */
let chatHistory = JSON.parse(localStorage.getItem("chat_history") || "[]");
let savedMemories = JSON.parse(localStorage.getItem("saved_memories") || "[]");
let userDefinedPersona = localStorage.getItem('shiba_persona') || "你是一个忠诚、温柔且风趣的伙伴。请遵守以下对话准则：1) 回复中不要使用表情符号，括号内的描述内容也不要写入回复文本；2) 使用自然的人类聊天模式，避免长句，保持对话简洁亲切。";

function cleanTextForSpeech(text) {
    // 移除表情符号和颜文字
    let cleaned = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    // 移除括号及其中的内容（包括中文括号和英文括号）
    cleaned = cleaned.replace(/[（\(].*?[）\)]/g, '');

    // 移除其他常见特殊符号
    cleaned = cleaned.replace(/[✨🌟🔥💫⭐️🎉💖💕💞💓💗💘❤️🧡💛💚💙💜🖤🤍🤎]/gu, '');

    // 移除多余的空格和标点
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
}

function speak(text) {
    window.speechSynthesis.cancel();

    // 清理文本，移除表情符号和括号内容
    const cleanedText = cleanTextForSpeech(text);

    const msg = new SpeechSynthesisUtterance(cleanedText);
    const voices = window.speechSynthesis.getVoices();
    msg.voice = voices.find(v => v.lang === "zh-CN") || voices[0];
    msg.pitch = 1.2;
    msg.rate = 1.0;
    window.speechSynthesis.speak(msg);
}

async function handleChat() {
    const userInput = document.getElementById('userInput');
    const aiText = document.getElementById('aiText');
    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = "";
    aiText.innerText = "思考中...";
    document.getElementById('saveMemoryBtn').style.display = 'none';

    chatHistory.push({ role: "user", content: text });
    if (chatHistory.length > 18) chatHistory = chatHistory.slice(-18); // 保持足够的上下文

    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "system", content: userDefinedPersona + " 此外，请严格遵守以下硬性准则：1) 回复中绝对不要使用表情符号或颜文字，括号内的描述性内容（如动作、表情描述）也不要写入回复文本；2) 使用自然的人类日常聊天模式，避免长句和复杂句式，保持对话简洁、亲切、口语化。" }, ...chatHistory]
            })
        });

        if (!response.ok) throw new Error("网络连接异常");
        const data = await response.json();
        const aiReply = data.choices[0].message.content;

        aiText.innerText = aiReply;
        speak(aiReply);
        document.getElementById('saveMemoryBtn').style.display = 'block';

        chatHistory.push({ role: "assistant", content: aiReply });
        localStorage.setItem("chat_history", JSON.stringify(chatHistory));

    } catch (err) {
        console.error("❌ 前端错误:", err.message);

        // 详细的错误分类
        let errorMessage = err.message;
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            errorMessage = '网络连接失败，请检查服务器是否运行或网络连接';
        } else if (err.message.includes('CORS')) {
            errorMessage = '跨域访问被拒绝，请检查CORS配置';
        } else if (err.message.includes('服务器错误')) {
            errorMessage = `服务器错误: ${response?.status || '未知状态'}`;
        }

        aiText.innerText = `出错了：${errorMessage}`;
        console.error("详细错误信息:", { err, response, API_BASE });
    }
}

// 绑定发送
document.getElementById('sendBtn').onclick = handleChat;
document.getElementById('userInput').onkeypress = (e) => e.key === "Enter" && handleChat();

/**
 * ==========================================
 * 5. 设置面板与记忆管理
 * ==========================================
 */
const panel = document.getElementById('settingsPanel');
const overlay = document.getElementById('uiOverlay');

document.getElementById('toggleSettings').onclick = (e) => {
    e.stopPropagation();
    const isActive = panel.classList.toggle('active');
    overlay.style.display = isActive ? 'block' : 'none';
    if (isActive) renderMemoryList();
};

overlay.onclick = () => {
    panel.classList.remove('active');
    overlay.style.display = 'none';
};

function saveSettings() {
    userDefinedPersona = document.getElementById('personaInput').value;
    localStorage.setItem('shiba_persona', userDefinedPersona);
    alert("性格已重塑，汪！");
}

function addCurrentToMemory() {
    const text = document.getElementById('aiText').innerText;
    if (text.includes("...") || text.includes("抱歉")) return;

    savedMemories.unshift({ id: Date.now(), text, time: new Date().toLocaleTimeString() });
    localStorage.setItem("saved_memories", JSON.stringify(savedMemories));
    document.getElementById('saveMemoryBtn').style.display = 'none';
    alert("记忆已存入记忆库");
}

function renderMemoryList() {
    const list = document.getElementById('memoryList');
    list.innerHTML = savedMemories.length ? '' : '<p style="font-size:12px; opacity:0.3; text-align:center;">尚无记忆碎片</p>';

    savedMemories.slice(0, 15).forEach(mem => {
        const item = document.createElement('div');
        item.className = 'memory-item';
        item.innerHTML = `
            <div style="flex:1; overflow:hidden">
                <div style="white-space:nowrap; text-overflow:ellipsis; overflow:hidden">${mem.text}</div>
                <div style="font-size:10px; opacity:0.3">${mem.time}</div>
            </div>
            <span style="font-size:12px">▶️</span>
        `;
        item.onclick = (e) => {
            e.stopPropagation();
            document.getElementById('aiText').innerText = mem.text;
            speak(mem.text);
        };
        list.appendChild(item);
    });
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('personaInput').value = userDefinedPersona;
    renderMemoryList(); // 初始化记忆列表显示
});