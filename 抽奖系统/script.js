document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadSection = document.querySelector('.upload-section');
    const startBtn = document.getElementById('startBtn');
    const nameDisplay = document.getElementById('nameDisplay');
    const winnerList = document.getElementById('winnerList');
    
    let employees = [];
    let availableEmployees = [];
    let isDrawing = false;
    let drawInterval;
    
    // 设置文件上传区域点击事件
    uploadSection.addEventListener('click', function() {
        fileInput.click();
    });

    // 监听文件上传
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // 获取第一个工作表
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // 转换为JSON，只获取第一列数据
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // 提取第一列非空值作为员工名单
                employees = jsonData
                    .map(row => row[0])
                    .filter(name => name && typeof name === 'string' && name.trim() !== '');
                
                // 复制一份可用名单
                availableEmployees = [...employees];
                
                if (employees.length > 0) {
                    nameDisplay.textContent = `已加载 ${employees.length} 名员工`;
                    startBtn.disabled = false;
                    
                    // 显示文件名
                    document.querySelector('.hint').textContent = `已选择: ${file.name}`;
                } else {
                    nameDisplay.textContent = '未检测到有效数据';
                    startBtn.disabled = true;
                }
            } catch (error) {
                console.error('解析Excel文件时出错:', error);
                nameDisplay.textContent = '文件解析失败';
            }
        };
        
        reader.readAsArrayBuffer(file);
    });

    // 开始/停止抽奖
    startBtn.addEventListener('click', function() {
        if (isDrawing) {
            stopDrawing();
        } else {
            startDrawing();
        }
    });

    // 开始抽奖动画
    function startDrawing() {
        if (availableEmployees.length === 0) {
            nameDisplay.textContent = '所有员工已抽完';
            return;
        }
        
        isDrawing = true;
        startBtn.textContent = '停止';
        nameDisplay.classList.add('rotating');
        
        // 快速切换显示名字的动画效果
        drawInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * availableEmployees.length);
            nameDisplay.textContent = availableEmployees[randomIndex];
            
            // 添加额外视觉效果
            nameDisplay.style.color = getRandomColor();
            nameDisplay.style.transform = `scale(${0.9 + Math.random() * 0.2})`;
        }, 50);
    }
    
    // 停止抽奖并显示结果
    function stopDrawing() {
        if (!isDrawing) return;
        
        clearInterval(drawInterval);
        isDrawing = false;
        startBtn.textContent = '开始抽奖';
        nameDisplay.classList.remove('rotating');
        
        // 选择获奖者
        const winnerIndex = Math.floor(Math.random() * availableEmployees.length);
        const winner = availableEmployees[winnerIndex];
        
        // 从可用名单中移除
        availableEmployees.splice(winnerIndex, 1);
        
        // 固定显示获奖者
        nameDisplay.textContent = winner;
        nameDisplay.style.color = '#FFD700'; // 金色
        nameDisplay.style.transform = 'scale(1.05)';
        
        // 添加到获奖名单
        addWinner(winner);
        
        // 更新按钮状态
        if (availableEmployees.length === 0) {
            startBtn.disabled = true;
            startBtn.textContent = '抽奖结束';
        }
        
        // 添加烟花效果
        createFireworks();
    }
    
    // 添加获奖者到列表
    function addWinner(name) {
        const winnerItem = document.createElement('div');
        winnerItem.className = 'winner-item';
        winnerItem.textContent = name;
        winnerList.appendChild(winnerItem);
    }
    
    // 生成随机颜色
    function getRandomColor() {
        const colors = [
            '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
            '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', 
            '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 创建烟花效果
    function createFireworks() {
        const fireworksCount = 20;
        const container = document.querySelector('.lottery-section');
        
        for (let i = 0; i < fireworksCount; i++) {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            firework.style.backgroundColor = getRandomColor();
            firework.style.position = 'absolute';
            firework.style.width = '5px';
            firework.style.height = '5px';
            firework.style.borderRadius = '50%';
            firework.style.opacity = '0';
            firework.style.transform = 'scale(0)';
            firework.style.animation = 'firework 0.8s ease-out forwards';
            firework.style.animationDelay = Math.random() * 0.5 + 's';
            
            container.appendChild(firework);
            
            // 移除烟花元素
            setTimeout(() => {
                container.removeChild(firework);
            }, 2000);
        }
    }
    
    // 添加烟花动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes firework {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(15); opacity: 1; }
            100% { transform: scale(30); opacity: 0; }
        }
        .lottery-section {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
});
