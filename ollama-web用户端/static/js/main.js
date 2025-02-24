document.addEventListener('DOMContentLoaded', function() {
    const modelSelector = document.getElementById('modelSelector');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messageList = document.getElementById('messageList');
    
    let isLoading = false;
    // 获取可用模型列表
    // 在 fetchModels 函数中修改处理逻辑
    async function fetchModels() {
        try {
            const response = await fetch('/api/models');
            const data = await response.json();
            
            // 清空现有选项（保留默认选项）
            modelSelector.innerHTML = '<option value="">选择模型</option>';
            
            // 确保 data.models 存在且是数组
            if (data.models && Array.isArray(data.models)) {
                data.models.forEach(model => {
                    const option = document.createElement('option');
                    // 根据返回的数据结构获取模型名称
                    const modelName = model.name || model.model || '';
                    if (modelName) {
                        option.value = modelName;
                        option.textContent = modelName;
                        modelSelector.appendChild(option);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching models:', error);
        }
    }
    // 添加消息到聊天界面
    function addMessage(role, content, thinking = '') {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        const roleText = document.createElement('strong');
        roleText.textContent = role === 'user' ? '用户: ' : '助手: ';
        messageDiv.appendChild(roleText);
        
        if (thinking) {
            const thinkingDiv = document.createElement('div');
            thinkingDiv.className = 'thinking';
            thinkingDiv.textContent = thinking;
            messageDiv.appendChild(thinkingDiv);
        }
        
        const responseDiv = document.createElement('div');
        responseDiv.className = 'response';
        responseDiv.textContent = content;
        messageDiv.appendChild(responseDiv);
        
        messageList.appendChild(messageDiv);
        messageList.scrollTop = messageList.scrollHeight;
    }

    // 发送消息
    async function sendMessage() {
        const message = messageInput.value.trim();
        const selectedModel = modelSelector.value;
        
        if (!message || !selectedModel || isLoading) return;
        
        isLoading = true;
        messageInput.value = '';
        addMessage('user', message);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: selectedModel,
                    message: message
                })
            });
    
            const reader = response.body.getReader();
            let assistantMessage = { content: '', thinking: '' };
            let messageDiv = null;
            let currentText = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (!line || !line.startsWith('data: ')) continue;
                    const data = JSON.parse(line.slice(5));
                    
                    if (data.response) {
                        currentText += data.response;
                        
                        // 改进 think 标签的处理逻辑
                        let displayContent = currentText;
                        let thinkContent = '';
                        
                        // 检查是否包含完整的 think 标签
                        const thinkMatch = currentText.match(/<think>([\s\S]*?)<\/think>/);
                        if (thinkMatch) {
                            // 提取 think 标签内容
                            thinkContent = thinkMatch[1].trim();
                            // 移除 think 标签及其内容，保留其他文本
                            displayContent = currentText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                        }
                        
                        // 更新或创建消息元素
                        if (messageDiv) {
                            messageDiv.remove();
                        }
                        
                        messageDiv = document.createElement('div');
                        messageDiv.className = 'message';
                        const roleText = document.createElement('strong');
                        roleText.textContent = '助手: ';
                        messageDiv.appendChild(roleText);
                        
                        // 只有在有 think 内容时才创建 thinking 区块
                        if (thinkContent) {
                            const thinkingDiv = document.createElement('div');
                            thinkingDiv.className = 'thinking';
                            thinkingDiv.textContent = thinkContent;
                            messageDiv.appendChild(thinkingDiv);
                        }
                        
                        // 只有在有实际内容时才创建响应区块
                        if (displayContent) {
                            const responseDiv = document.createElement('div');
                            responseDiv.className = 'response';
                            responseDiv.textContent = displayContent;
                            messageDiv.appendChild(responseDiv);
                        }
                        
                        messageList.appendChild(messageDiv);
                        messageList.scrollTop = messageList.scrollHeight;
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            isLoading = false;
        }
    }

    // 事件监听
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 初始化加载模型列表
    fetchModels();
});