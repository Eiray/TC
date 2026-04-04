const API_BASE = "https://tc-tqaf.onrender.com";
let chatHistory = JSON.parse(localStorage.getItem("chat_history") || "[]");
// 角色设定：告诉 AI 它是一只金毛/柴犬
const SYSTEM_PROMPT = "你是一只可爱、忠诚、活泼的电子柴犬，名字叫金豆。喜欢和主人互动，非常粘主人，回答要简洁、幽默、温柔、风趣、充满关怀。";
// ==========================================
// 1. 基础环境设置
// ==========================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('particleCanvas'), 
    alpha: true, 
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 5); 

// ==========================================
// 2. 背景粒子系统
// ==========================================
const bgGeometry = new THREE.BufferGeometry();
const bgCount = 3000;
const bgPos = new Float32Array(bgCount * 3);
for(let i=0; i<bgCount*3; i++) bgPos[i] = (Math.random() - 0.5) * 20;
bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
const bgMaterial = new THREE.PointsMaterial({ size: 0.015, color: 0xffffff, transparent: true, opacity: 0.4 });
const bgSystem = new THREE.Points(bgGeometry, bgMaterial);
scene.add(bgSystem);

// ==========================================
// 3. 灯光设置 (增强亮度)
// ==========================================
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(1, 1, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.8)); 

// ==========================================
// 4. 加载 3D 模型
// ==========================================
let dogModel;
const loader = new THREE.GLTFLoader();
const modelUrl = 'shiba_dog.glb'; 

// 参数调节区
let baseScale = 0.5;      // 模型基础大小 (如果还是大，请调成 0.2)
let baseY = 1;         // 模型在画面中的上下位置 (负数越小越靠下)
let distortion = 0;       // 点击产生的扭曲能量

loader.load(modelUrl, function (gltf) {
    dogModel = gltf.scene;
    // 初始缩放
    dogModel.scale.set(baseScale, baseScale, baseScale);
    scene.add(dogModel);
    console.log("模型加载成功！");
}, undefined, function (error) {
    console.error("加载失败：", error);
});

// ==========================================
// 5. 动画循环 (核心逻辑)
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.002;

    // 背景旋转
    if (bgSystem) bgSystem.rotation.y += 0.0003;
    
    if (dogModel) {
        // --- 灵动感 1：自动平滑自转 ---
        dogModel.rotation.y += 0.005; 

        // --- 灵动感 2：呼吸 + 点击扭曲 (Scale) ---
        // 呼吸会让大小在 baseScale 基础上微调
        let breath = Math.sin(time) * 0.015; 
        // 最终缩放 = 基础 + 呼吸 + 点击波动
        let s = baseScale + breath + distortion;
        dogModel.scale.set(s, s, s);

        // --- 灵动感 3：上下漂浮 (Position) ---
        // 使用 baseY 作为基准，加上正弦波实现悬浮感
        dogModel.position.y = baseY + Math.sin(time * 0.5) * 0.1;

        // --- 灵动感 4：点击时的 Z 轴摇摆 (Wobble) ---
        // 点击时产生左右晃动
        dogModel.rotation.z = Math.sin(time * 15) * distortion * 2;

        // --- 能量衰减 ---
        // 每一帧扭曲能量减少 10%，形成“Duang”的一下弹回来的效果
        distortion *= 0.92; 
    }
    
    renderer.render(scene, camera);
}
animate();

// ==========================================
// 6. 交互事件
// ==========================================

// 点击互动
window.addEventListener('click', () => {
    // 1. 注入扭曲能量
    distortion = 0.1; 
    
    // 2. 触发 AI 逻辑 (如果有输入文字则处理对话)
    const text = userInput.value.trim();
    if (text) {
        handleChat();
    } else {
        // 如果没输入文字，只点击小狗，可以让它简单的“汪”一下
        aiText.innerText = "汪！你在摸我吗？";
        speak("汪！你在摸我吗？");
    }
});

// 窗口自适应
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 对话系统
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const aiText = document.getElementById('aiText');


function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    
    // 获取当前系统的所有可用声音
    const voices = window.speechSynthesis.getVoices();
    // 尝试寻找一个中文女声或男声（不同电脑名字不同）
    msg.voice = voices.find(v => v.name.includes("Xiaoxiao") || v.lang === "zh-CN");
    
    msg.pitch = 1.2; // 这里的数值可以微调，0.8 偏成熟，1.2 偏少年
    msg.rate = 0.95; // 语速稍慢更显温柔
    msg.volume = 1.0;
    
    window.speechSynthesis.speak(msg);
}

// 绑定发送按钮
sendBtn.onclick = (e) => {
    e.stopPropagation(); // 防止触发点击页面的 distortion 叠加
    handleChat();
};
userInput.onkeypress = (e) => { if(e.key === "Enter") handleChat(); };

// 记忆数组：保留最近 10 轮对话

// 用户自定义性格（初始值）
let userDefinedPersona = "你是一个温和、理性、富有同情心的陪伴者。你有着柴犬的外表，但灵魂是一个成熟的人类。你忠诚、幽默，能洞察用户的情绪，提供情绪价值。不要频繁说汪，要像人一样交流。";

async function handleChat() {
    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = "";
    aiText.innerText = "思考中...";

    const systemMessage = {
        role: "system",
        content: userDefinedPersona
    };

    const userMessage = {
        role: "user",
        content: text
    };

    // ✅ 正确维护历史
    chatHistory.push(userMessage);
    chatHistory = chatHistory.slice(-20);

    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [systemMessage, ...chatHistory]
            })
        });

        // ❗关键防崩
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "服务器错误");
        }

        const data = await response.json();

        if (!data?.choices?.[0]?.message?.content) {
            throw new Error("返回格式异常");
        }

        const aiReply = data.choices[0].message.content;

        // ✅ 更新UI
        aiText.innerText = aiReply;
        speak(aiReply);

        // ✅ 存入历史
        chatHistory.push({
            role: "assistant",
            content: aiReply
        });

    } catch (err) {
        console.error("❌ 前端错误:", err.message);

        aiText.innerText = `出错了：${err.message}`;
    }
    localStorage.setItem("chat_history", JSON.stringify(chatHistory));
}


function saveSettings() {
    userDefinedPersona = document.getElementById('personaInput').value;
    localStorage.setItem('shiba_persona', userDefinedPersona); // 保存到浏览器缓存
    alert("性格已重塑，汪！");
}

// 页面加载时恢复之前的性格
window.onload = () => {
    const saved = localStorage.getItem('shiba_persona');
    if (saved) {
        userDefinedPersona = saved;
        document.getElementById('personaInput').value = saved;
    }
};

document.getElementById('toggleSettings').onclick = () => {
    const panel = document.getElementById('settingsPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
};