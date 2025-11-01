// Flow Tomato - 本地存储管理模块

class StorageManager {
  constructor() {
    this.currentUserKey = null;
  }

  // 初始化存储管理器
  init() {
    // 检查是否有之前保存的用户密钥
    const savedKey = localStorage.getItem('flowTomatoUserKey');
    if (savedKey) {
      this.currentUserKey = savedKey;
      return true;
    }
    return false;
  }

  // 设置当前用户密钥
  setUserKey(key) {
    if (!key || key.trim() === '') {
      throw new Error('用户密钥不能为空');
    }
    
    this.currentUserKey = key.trim();
    localStorage.setItem('flowTomatoUserKey', this.currentUserKey);
    
    // 如果是新用户，初始化用户数据
    if (!this.getUserData()) {
      this.initUserData();
    }
    
    return this.currentUserKey;
  }

  // 获取当前用户密钥
  getUserKey() {
    return this.currentUserKey;
  }

  // 登出，清除当前用户密钥
  logout() {
    this.currentUserKey = null;
    localStorage.removeItem('flowTomatoUserKey');
  }

  // 获取用户数据存储键
  getUserDataKey() {
    if (!this.currentUserKey) {
      throw new Error('未设置用户密钥');
    }
    return `flowTomato_${this.currentUserKey}`;
  }

  // 初始化用户数据
  initUserData() {
    const userData = {
      key: this.currentUserKey,
      tasks: [],
      totalPomodoros: 0,
      settings: {
        autoStartBreak: true,
        notificationEnabled: true,
        soundEnabled: true
      }
    };
    
    this.saveUserData(userData);
    return userData;
  }

  // 获取用户数据
  getUserData() {
    if (!this.currentUserKey) {
      return null;
    }
    
    try {
      const dataKey = this.getUserDataKey();
      const userData = localStorage.getItem(dataKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('获取用户数据失败:', error);
      return null;
    }
  }

  // 保存用户数据
  saveUserData(userData) {
    if (!this.currentUserKey) {
      throw new Error('未设置用户密钥');
    }
    
    try {
      const dataKey = this.getUserDataKey();
      localStorage.setItem(dataKey, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('保存用户数据失败:', error);
      return false;
    }
  }

  // 添加任务
  addTask(taskTitle) {
    if (!taskTitle || taskTitle.trim() === '') {
      throw new Error('任务标题不能为空');
    }
    
    const userData = this.getUserData();
    if (!userData) {
      throw new Error('用户数据不存在');
    }
    
    const newTask = {
      id: this.generateId(),
      title: taskTitle.trim(),
      completed: false,
      estimatedPomodoros: 0,
      completedPomodoros: 0,
      notes: '',
      createdAt: new Date().toISOString()
    };
    
    userData.tasks.push(newTask);
    this.saveUserData(userData);
    
    return newTask;
  }

  // 更新任务
  updateTask(taskId, updates) {
    const userData = this.getUserData();
    if (!userData) {
      throw new Error('用户数据不存在');
    }
    
    const taskIndex = userData.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('任务不存在');
    }
    
    // 更新任务属性
    userData.tasks[taskIndex] = {
      ...userData.tasks[taskIndex],
      ...updates
    };
    
    this.saveUserData(userData);
    return userData.tasks[taskIndex];
  }

  // 删除任务
  deleteTask(taskId) {
    const userData = this.getUserData();
    if (!userData) {
      throw new Error('用户数据不存在');
    }
    
    const taskIndex = userData.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('任务不存在');
    }
    
    userData.tasks.splice(taskIndex, 1);
    this.saveUserData(userData);
    
    return true;
  }

  // 获取任务
  getTask(taskId) {
    const userData = this.getUserData();
    if (!userData) {
      return null;
    }
    
    return userData.tasks.find(task => task.id === taskId) || null;
  }

  // 获取所有任务
  getAllTasks() {
    const userData = this.getUserData();
    if (!userData) {
      return [];
    }
    
    return userData.tasks;
  }

  // 增加番茄计数
  incrementPomodoroCount(taskId) {
    const userData = this.getUserData();
    if (!userData) {
      throw new Error('用户数据不存在');
    }
    
    const taskIndex = userData.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('任务不存在');
    }
    
    // 增加任务的完成番茄数
    userData.tasks[taskIndex].completedPomodoros++;
    
    // 增加总番茄数
    userData.totalPomodoros++;
    
    this.saveUserData(userData);
    
    return {
      task: userData.tasks[taskIndex],
      totalPomodoros: userData.totalPomodoros
    };
  }

  // 获取总番茄数
  getTotalPomodoros() {
    const userData = this.getUserData();
    if (!userData) {
      return 0;
    }
    
    return userData.totalPomodoros;
  }

  // 获取用户设置
  getUserSettings() {
    const userData = this.getUserData();
    if (!userData) {
      return {
        autoStartBreak: true,
        notificationEnabled: true,
        soundEnabled: true
      };
    }
    
    return userData.settings;
  }

  // 更新用户设置
  updateUserSettings(settings) {
    const userData = this.getUserData();
    if (!userData) {
      throw new Error('用户数据不存在');
    }
    
    userData.settings = {
      ...userData.settings,
      ...settings
    };
    
    this.saveUserData(userData);
    return userData.settings;
  }

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// 创建全局存储管理器实例
const storageManager = new StorageManager();