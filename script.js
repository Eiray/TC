// --- 1. 初始化背景粒子 (Three.js) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('particleCanvas'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// 创建一群随机点
const particlesGeometry = new THREE.BufferGeometry();
const count = 3000;
const positions = new Float32Array(count * 3);
for(let i=0; i<count*3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particlesMaterial = new THREE.PointsMaterial({ size: 0.01, color: 0xffffff, transparent: true, opacity: 0.4 });
const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);

camera.position.z = 3;

function animate() {
    requestAnimationFrame(animate);
    particleSystem.rotation.y += 0.0005; // 让粒子缓慢旋转
    renderer.render(scene, camera);
}
animate();

// --- 2. 对话逻辑 ---
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const aiText = document.getElementById('aiText');

// 发送功能
function handleChat() {
    const text = userInput.value.trim();
    if (text === "") return;

    // 清空输入框
    userInput.value = "";

    // 简单模拟 AI 逻辑（初学者可以先用这种判断式逻辑，后期再接 API）
    let response = "";
    if (text.includes("你好")) {
        response = "你好呀，今天也是充满阳光的一天！汪！";
    } else if (text.includes("难过")) {
        response = "别难过，我会一直陪在你身边的，给你一个云抱抱。";
    } else {
        response = "你说得对，我在听着呢。汪汪！";
    }

    // 更新页面文字
    aiText.innerText = response;

    // 触发语音回复
    speak(response);
}

// 语音播放函数 (使用浏览器自带语音)
function speak(text) {
    // 取消当前正在播放的所有语音
    window.speechSynthesis.cancel();
    
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-CN'; // 设置为中文
    msg.pitch = 1.2;    // 音调稍微高一点，显得更活泼
    msg.rate = 1.0;     // 语速
    window.speechSynthesis.speak(msg);
}

// 绑定按钮和回车键
sendBtn.onclick = handleChat;
userInput.onkeypress = (e) => { if(e.key === "Enter") handleChat(); };

// 处理窗口大小变化
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});