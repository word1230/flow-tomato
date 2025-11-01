# Flow Tomato 番茄钟应用 - 实现设计文档

## 核心功能
1. 无登录任务系统（通过自定义Key进入个人空间）
2. 主任务管理（添加、完成、更新、删除）
3. 思路规划区（Idea Zone）
4. 番茄数预估
5. 番茄钟计时器（25分钟工作/5分钟休息）
6. 智能提醒系统（桌面通知和声音）
7. 灵活的任务完成机制
8. 番茄统计
9. 响应式设计

## 主要文件结构
```
FlowTomato/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── app.js          # 主应用逻辑
│   ├── timer.js        # 番茄钟计时器
│   ├── tasks.js        # 任务管理
│   ├── storage.js      # 本地存储管理
│   └── notifications.js # 通知系统
├── assets/
│   └── sounds/         # 提醒音效文件
└── README.md           # 项目说明
```

## 技术选型
- 前端框架：原生 JavaScript（保持轻量级）
- 数据存储：localStorage
- 样式：CSS Grid/Flexbox（响应式布局）
- 字体：Inter 或 Roboto（现代无衬线字体）

## 实现步骤
1. 创建基础HTML结构和CSS样式
2. 实现本地存储管理系统
3. 实现无登录任务系统（Key认证）
4. 实现主任务管理功能
5. 实现思路规划区
6. 实现番茄数预估功能
7. 实现番茄钟计时器
8. 实现智能提醒系统
9. 实现任务完成机制
10. 实现番茄统计功能
11. 优化响应式设计

## UI/UX 设计要点
- 色彩：以无彩色系（白、灰、深灰）为基底，单一蓝色作为高亮
- 布局：极简主义，大量留白
- 交互：快速、精准、不打扰
- 动画：最小化，避免分散注意力

## 数据结构设计
```javascript
// 用户数据结构
const userData = {
  key: "用户自定义Key",
  tasks: [
    {
      id: "唯一标识",
      title: "任务标题",
      completed: false,
      estimatedPomodoros: 0,
      completedPomodoros: 0,
      notes: "思路规划区内容",
      createdAt: "创建时间"
    }
  ],
  totalPomodoros: 0,
  settings: {
    autoStartBreak: true,
    notificationEnabled: true,
    soundEnabled: true
  }
}
```

## 部署说明
- 纯静态应用，可直接部署到 GitHub Pages 或 Cloudflare Pages
- 无需服务器端支持
- 所有数据存储在用户浏览器本地