document.addEventListener('DOMContentLoaded', () => {
    const result = document.getElementById('result');
    const buttons = document.querySelectorAll('button');
    let shouldClear = false; // 添加标志，用于判断是否需要清除显示

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // 添加点击动画效果
            button.classList.remove('ripple');
            void button.offsetWidth; // 触发重排以重启动画
            button.classList.add('ripple');

            if (button.classList.contains('clear')) {
                result.value = '';
                shouldClear = false;
            } else if (button.classList.contains('equals')) {
                try {
                    let expression = result.value;
                    
                    // 处理特殊函数
                    // 处理三角函数，确保参数被括号包围
                    expression = expression.replace(/sin\s*(\d+(?:\.\d+)?)/g, 'Math.sin($1)');
                    expression = expression.replace(/cos\s*(\d+(?:\.\d+)?)/g, 'Math.cos($1)');
                    expression = expression.replace(/tan\s*(\d+(?:\.\d+)?)/g, 'Math.tan($1)');
                    
                    // 处理根号，确保参数被括号包围
                    expression = expression.replace(/√\s*(\d+(?:\.\d+)?)/g, 'Math.sqrt($1)');
                    
                    // 处理已经带括号的情况
                    expression = expression.replace(/sin\(/g, 'Math.sin(');
                    expression = expression.replace(/cos\(/g, 'Math.cos(');
                    expression = expression.replace(/tan\(/g, 'Math.tan(');
                    expression = expression.replace(/√\(/g, 'Math.sqrt(');

                    const answer = eval(expression);
                    result.value = Number.isInteger(answer) ? answer : answer.toFixed(8);
                    shouldClear = true; // 设置标志，表示下次输入时需要清除
                    
                    // 添加结果显示动画
                    result.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        result.style.transform = 'scale(1)';
                    }, 200);
                } catch (error) {
                    result.value = 'Error';
                    shouldClear = true;
                }
            } else {
                if (shouldClear) {
                    result.value = '';
                    shouldClear = false;
                }
                const value = button.dataset.value;
                result.value += value;
            }
        });
    });
});