# Ollama Web Client

这是一个基于 Flask 的 Ollama Web 客户端，提供了友好的 Web 界面来与 Ollama 模型进行对话交互。

## 功能特点

- 自动获取并显示本地运行的 Ollama 模型列表
- 支持与选定模型进行实时对话
- 流式输出响应内容
- 特别优化了 deepseek 等模型的思考过程显示
- 响应式设计，适配不同屏幕尺寸

## 环境要求

- Python 3.7+
- Flask
- requests
- 本地运行的 Ollama 服务

## 安装步骤

1. 安装依赖：
```bash
pip install -r requirements.txt