// ========== 小狗状态数据 ==========
let mood = "happy";   // happy, hungry, excited
let energy = 80;

// ========== 对话库（按心情分类）==========
const talkResponses = {
    default: [
        "汪汪！今天天气真好～", 
        "呜呜，想出去玩！", 
        "你的手好温暖呀🐾",
        "我超喜欢你！❤️",
        "汪！有什么好吃的吗？"
    ],
    happy: [
        "汪汪！我好开心！✨", 
        "尾巴摇成螺旋桨啦～", 
        "今天超有精神！🎉"
    ],
    hungry: [
        "肚子咕噜噜... 好饿🥺", 
        "能给我一点吃的吗？", 
        "饿到汪汪叫🍖"
    ],
    excited: [
        "啊啊啊玩球球！冲鸭！", 
        "太好玩了！再来一次！", 
        "汪汪汪汪汪！（兴奋转圈）"
    ]
};

// ========== 工具函数：更新对话框文字并播放跳跃动画 ==========
function setDialog(message, withJump = true) {
    const dialogDiv = document.getElementById('dialogText');
    dialogDiv.textContent = message;
    // 对话框缩放闪动
    const bubble = document.querySelector('.bubble');
    bubble.style.transform = 'scale(1.01)';
    setTimeout(() => { bubble.style.transform = ''; }, 150);
    
    if (withJump) {
        const dogEmojiDiv = document.getElementById('dogEmoji');
        dogEmojiDiv.classList.remove('jump');
        void dogEmojiDiv.offsetWidth; // 强制重绘
        dogEmojiDiv.classList.add('jump');
        setTimeout(() => dogEmojiDiv.classList.remove('jump'), 500);
    }
}

// ========== 获取随机回复（支持动作参数） ==========
function getRandomMessage(customAction = null) {
    // 动作专属语句
    if (customAction === 'pet') {
        const petMsgs = ["呜～好舒服！再摸摸嘛🥰", "被摸头好幸福～", "汪！最喜欢被摸啦❤️"];
        return petMsgs[Math.floor(Math.random() * petMsgs.length)];
    }
    if (customAction === 'feed') {
        energy = Math.min(100, energy + 20);
        updateStatusText();
        const feedMsgs = ["吧唧吧唧！超好吃！🍖", "谢谢主人！我最爱骨头了～", "嗝～ 好满足！汪汪！"];
        return feedMsgs[Math.floor(Math.random() * feedMsgs.length)];
    }
    if (customAction === 'play') {
        mood = "excited";
        updateStatusText();
        const playMsgs = ["接住啦！汪汪！再来一球！🎾", "跑跑跳跳真开心！", "球球是我的最爱！"];
        return playMsgs[Math.floor(Math.random() * playMsgs.length)];
    }
    
    // 普通点击对话：根据心情选择语句库
    let msgList = talkResponses.default;
    if (mood === "happy") msgList = talkResponses.happy;
    else if (mood === "hungry") msgList = talkResponses.hungry;
    else if (mood === "excited") msgList = talkResponses.excited;
    
    // 30% 概率混入默认句子
    if (Math.random() < 0.3 && mood !== "hungry") {
        msgList = talkResponses.default;
    }
    return msgList[Math.floor(Math.random() * msgList.length)];
}

// ========== 更新状态栏文字和表情 ==========
function updateStatusText() {
    const statusSpan = document.getElementById('statusMsg');
    if (energy < 30) {
        mood = "hungry";
        statusSpan.innerHTML = "🍽️ 肚子饿饿… 快喂我吃点东西吧";
    } else if (mood === "excited") {
        statusSpan.innerHTML = "⚡ 超兴奋！摇尾巴中～～";
    } else if (mood === "happy") {
        statusSpan.innerHTML = "🐶 心情很好，尾巴翘高高 ❤️";
    } else {
        statusSpan.innerHTML = "🐕 温顺的小狗 等你互动～";
    }
    
    // 根据心情改变小狗表情符号
    const dogEmojiSpan = document.getElementById('dogEmoji');
    if (mood === "hungry") dogEmojiSpan.textContent = "🐕‍🦺🍽️";
    else if (mood === "excited") dogEmojiSpan.textContent = "🐕⚡";
    else dogEmojiSpan.textContent = "🐕";
}

// ========== 事件处理 ==========
function onDogClick() {
    // 自然消耗能量
    if (energy > 5) energy -= 2;
    if (energy < 25 && mood !== "hungry") {
        mood = "hungry";
        updateStatusText();
    }
    const message = getRandomMessage(null);
    setDialog(message, true);
    // 添加摇尾巴特效
    const dogZone = document.getElementById('dogClickZone');
    dogZone.classList.add('shake');
    setTimeout(() => dogZone.classList.remove('shake'), 400);
}

function onPet() {
    const message = getRandomMessage('pet');
    setDialog(message, true);
    if (mood === "hungry") {
        setTimeout(() => setDialog("虽然很饿，但摸摸头还是好开心🥺", true), 1000);
    } else {
        mood = "happy";
        updateStatusText();
    }
    const dogEmojiDiv = document.getElementById('dogEmoji');
    dogEmojiDiv.classList.add('shake');
    setTimeout(() => dogEmojiDiv.classList.remove('shake'), 300);
}

function onFeed() {
    const message = getRandomMessage('feed');
    setDialog(message, true);
    mood = "happy";
    if (energy > 80) energy = 100;
    updateStatusText();
    const dogEmojiDiv = document.getElementById('dogEmoji');
    dogEmojiDiv.classList.add('jump');
    setTimeout(() => dogEmojiDiv.classList.remove('jump'), 500);
}

function onPlay() {
    if (energy < 15) {
        setDialog("呜呜… 没力气玩球了，先喂我吃点东西吧🥺", true);
        return;
    }
    const message = getRandomMessage('play');
    setDialog(message, true);
    energy = Math.max(0, energy - 15);
    mood = "excited";
    updateStatusText();
    const dogArea = document.getElementById('dogClickZone');
    dogArea.classList.add('shake');
    setTimeout(() => dogArea.classList.remove('shake'), 400);
}

// ========== 绑定事件监听 ==========
document.getElementById('dogClickZone').addEventListener('click', onDogClick);
document.getElementById('petBtn').addEventListener('click', onPet);
document.getElementById('feedBtn').addEventListener('click', onFeed);
document.getElementById('playBtn').addEventListener('click', onPlay);

// ========== 初始化 ==========
updateStatusText();
setTimeout(() => {
    setDialog("汪汪！我是你的小狗伙伴～ 摸我喂我陪我玩吧！🐕", true);
}, 200);