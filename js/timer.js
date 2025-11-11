// Flow Tomato - 番茄钟计时器模块

class TimerManager {
  constructor() {
    this.timerDisplay = null;
    this.timerStatus = null;
    this.startBtn = null;
    this.pauseBtn = null;
    this.resetBtn = null;
    this.currentTaskId = null;
    this.isRunning = false;
    this.isPaused = false;
    this.isBreak = false;
    this.isLongBreak = false;
    this.timeRemaining = 25 * 60; // 默认25分钟（秒）
    this.workDuration = 25 * 60; // 工作时间（秒）
    this.shortBreakDuration = 5 * 60; // 短休息时间（秒）
    this.longBreakDuration = 15 * 60; // 长休息时间（秒）
    this.pomodoroCount = 0; // 连续完成的番茄钟数
    this.timerInterval = null;
    
    // 修复后台计时问题的关键属性
    this.startTime = null; // 计时器开始时间（时间戳）
    this.pauseStartTime = null; // 暂停开始时间（时间戳）
    this.pausedTime = 0; // 累计暂停时间（毫秒）
    this.lastTickTime = null; // 上次tick时间（用于计算时间差）
  }

  // 初始化计时器
  init() {
    // 获取DOM元素
    this.timerDisplay = document.getElementById('timer-display');
    this.timerStatus = document.getElementById('timer-status');
    this.startBtn = document.getElementById('start-timer-btn');
    this.pauseBtn = document.getElementById('pause-timer-btn');
    this.resetBtn = document.getElementById('reset-timer-btn');
    
    // 绑定事件
    this.bindEvents();
    
    // 初始化页面可见性变化监听器
    this.initVisibilityListener();
    
    // 初始化时间设置
    this.updateDurations();
    
    // 初始化显示
    this.updateDisplay();
  }

  // 更新时间设置
  updateDurations() {
    const settings = storageManager.getUserSettings();
    const isTestMode = settings.testMode;
    
    if (isTestMode) {
      // 测试模式：时间缩短为5秒
      this.workDuration = 5;
      this.shortBreakDuration = 5;
      this.longBreakDuration = 5;
    } else {
      // 正常模式
      this.workDuration = 25 * 60; // 25分钟
      this.shortBreakDuration = 5 * 60; // 5分钟
      this.longBreakDuration = 15 * 60; // 15分钟
    }
    
    // 如果计时器没有运行，更新当前剩余时间
    if (!this.isRunning) {
      if (this.isBreak) {
        this.timeRemaining = this.isLongBreak ? this.longBreakDuration : this.shortBreakDuration;
      } else {
        this.timeRemaining = this.workDuration;
      }
      
      // 更新显示
      this.updateDisplay();
    }
  }

  // 绑定事件
  bindEvents() {
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.start());
    }
    
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => this.pause());
    }
    
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.reset());
    }
  }

  // 初始化页面可见性变化监听器
  initVisibilityListener() {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // 当页面重新可见时，立即同步时间显示和标题
        this.syncTimeDisplay();
      }
    });
  }

  // 同步时间显示和页面标题
  syncTimeDisplay() {
    if (this.isRunning && !this.isPaused) {
      // 如果计时器正在运行，立即计算当前时间并更新显示
      this.tick();
    } else {
      // 如果计时器没有运行，只更新显示
      this.updateDisplay();
    }
  }

  // 设置当前任务
  setCurrentTask(taskId) {
    this.currentTaskId = taskId;
    
    // 如果计时器正在运行，重置它
    if (this.isRunning) {
      this.reset();
    }
    
    // 同步时间显示
    this.syncTimeDisplay();
    
    // 更新状态显示
    this.updateStatus();
  }

  // 设置当前任务（不重置计时器）
  setCurrentTaskWithoutReset(taskId) {
    this.currentTaskId = taskId;
    
    // 同步时间显示
    this.syncTimeDisplay();
    
    // 更新状态显示
    this.updateStatus();
  }

  // 开始计时
  start() {
    // 检查是否有当前任务
    if (!this.currentTaskId && !this.isBreak) {
      alert('请先选择一个任务');
      return;
    }
    
    // 如果是暂停状态，恢复计时
    if (this.isPaused) {
      this.resume();
      return;
    }
    
    // 开始计时
    this.isRunning = true;
    this.isPaused = false;
    
    // 记录开始时间和上次tick时间
    this.startTime = Date.now();
    this.lastTickTime = Date.now();
    
    // 如果不是暂停恢复，清除累计暂停时间
    if (!this.pauseStartTime) {
      this.pausedTime = 0;
    }
    
    // 更新按钮状态
    this.updateButtonStates();
    
    // 更新状态显示
    this.updateStatus();
    
    // 启动计时器 - 减少到每250ms检查一次，提高精度
    this.timerInterval = setInterval(() => this.tick(), 250);
  }

  // 暂停计时
  pause() {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    this.pauseStartTime = Date.now();
    
    // 更新按钮状态
    this.updateButtonStates();
    
    // 更新状态显示
    this.updateStatus();
    
    // 清除计时器
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  // 恢复计时
  resume() {
    if (!this.isRunning || !this.isPaused) return;
    
    this.isPaused = false;
    
    // 计算累计暂停时间
    if (this.pauseStartTime) {
      this.pausedTime += Date.now() - this.pauseStartTime;
      this.pauseStartTime = null;
    }
    
    // 重新设置上次tick时间
    this.lastTickTime = Date.now();
    
    // 更新按钮状态
    this.updateButtonStates();
    
    // 更新状态显示
    this.updateStatus();
    
    // 重新启动计时器 - 减少到每250ms检查一次，提高精度
    this.timerInterval = setInterval(() => this.tick(), 250);
  }

  // 重置计时器
  reset() {
    // 清除计时器
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    
    // 重置状态
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.lastTickTime = null;
    this.pauseStartTime = null;
    this.pausedTime = 0;
    
    // 如果不是休息时间，重置为工作时间
    if (!this.isBreak) {
      this.timeRemaining = this.workDuration;
    } else {
      // 如果是休息时间，重置为相应的休息时间
      this.timeRemaining = this.isLongBreak ? this.longBreakDuration : this.shortBreakDuration;
    }
    
    // 更新按钮状态
    this.updateButtonStates();
    
    // 更新显示
    this.updateDisplay();
    this.updateStatus();
  }

  // 计时器滴答 - 基于时间差的准确计时
  tick() {
    // 获取当前时间
    const now = Date.now();
    
    // 计算实际经过的时间（考虑暂停时间）
    const elapsed = now - this.startTime - this.pausedTime;
    
    // 计算应该剩余的时间（秒）
    const targetDuration = this.isBreak ? 
      (this.isLongBreak ? this.longBreakDuration : this.shortBreakDuration) : 
      this.workDuration;
    
    const newTimeRemaining = Math.max(0, targetDuration - Math.floor(elapsed / 1000));
    
    // 只有当时间真的改变时才更新显示和检查完成
    if (newTimeRemaining !== this.timeRemaining) {
      this.timeRemaining = newTimeRemaining;
      
      // 更新显示
      this.updateDisplay();
      
      // 检查时间是否到了
      if (this.timeRemaining <= 0) {
        this.timerComplete();
      }
    }
    
    // 更新上次tick时间
    this.lastTickTime = now;
  }

  // 计时器完成
  timerComplete() {
    // 清除计时器
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    
    // 重置运行状态
    this.isRunning = false;
    this.isPaused = false;
    
    // 处理计时器完成
    if (this.isBreak) {
      // 休息时间结束
      this.breakComplete();
    } else {
      // 工作时间结束
      this.workComplete();
    }
    
    // 更新按钮状态
    this.updateButtonStates();
  }

  // 工作时间完成
  workComplete() {
    // 增加番茄钟计数
    this.pomodoroCount++;
    
    // 增加任务的完成番茄数
    if (this.currentTaskId && window.taskManager) {
      window.taskManager.incrementTaskPomodoros(this.currentTaskId);
      
      // 检查任务是否完成所有预估番茄
      if (window.taskManager.isTaskPomodorosCompleted(this.currentTaskId)) {
        // 显示任务完成确认弹窗
        this.showTaskCompleteModal();
      }
    }
    
    // 显示通知
    const currentTask = this.currentTaskId ? window.taskManager.getTask(this.currentTaskId) : null;
    const taskTitle = currentTask ? currentTask.title : '当前任务';
    notificationManager.showWorkEndNotification(taskTitle);
    
    // 检查是否是长休息时间
    if (this.pomodoroCount % 4 === 0) {
      // 每4个番茄钟后进行长休息
      this.startLongBreak();
      notificationManager.showLongBreakStartNotification();
    } else {
      // 短休息
      this.startShortBreak();
    }
  }

  // 休息时间完成
  breakComplete() {
    // 显示通知
    notificationManager.showBreakEndNotification();
    
    // 休息结束后，重置为番茄钟模式
    this.isBreak = false;
    this.isLongBreak = false;
    this.timeRemaining = this.workDuration;
    
    // 重置运行状态和时间相关状态
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.lastTickTime = null;
    this.pauseStartTime = null;
    this.pausedTime = 0;
    
    // 更新显示
    this.updateDisplay();
    this.updateStatus();
    this.updateButtonStates();
    
    // 如果设置了自动开始工作，则自动开始下一个番茄钟
    if (storageManager.getUserSettings().autoStartWork) {
      this.start();
    }
  }

  // 开始短休息
  startShortBreak() {
    this.isBreak = true;
    this.isLongBreak = false;
    this.timeRemaining = this.shortBreakDuration;
    
    // 更新显示
    this.updateDisplay();
    this.updateStatus();
    
    // 自动开始休息
    if (storageManager.getUserSettings().autoStartBreak) {
      this.start();
    }
  }

  // 开始长休息
  startLongBreak() {
    this.isBreak = true;
    this.isLongBreak = true;
    this.timeRemaining = this.longBreakDuration;
    
    // 更新显示
    this.updateDisplay();
    this.updateStatus();
    
    // 自动开始休息
    if (storageManager.getUserSettings().autoStartBreak) {
      this.start();
    }
  }

  // 开始下一个番茄钟
  startNextPomodoro() {
    this.isBreak = false;
    this.isLongBreak = false;
    this.timeRemaining = this.workDuration;
    
    // 重置时间相关状态
    this.startTime = null;
    this.lastTickTime = null;
    this.pauseStartTime = null;
    this.pausedTime = 0;
    
    // 更新显示
    this.updateDisplay();
    this.updateStatus();
    
    // 自动开始
    this.start();
  }

  // 显示任务完成确认弹窗
  showTaskCompleteModal() {
    const modal = document.getElementById('task-complete-modal');
    if (modal) {
      modal.classList.remove('hidden');
      
      // 绑定确认按钮事件
      const confirmBtn = document.getElementById('confirm-task-complete');
      const cancelBtn = document.getElementById('cancel-task-complete');
      
      // 移除旧的事件监听器
      const newConfirmBtn = confirmBtn.cloneNode(true);
      const newCancelBtn = cancelBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
      
      // 添加新的事件监听器
      newConfirmBtn.addEventListener('click', () => {
        if (this.currentTaskId && window.taskManager) {
          window.taskManager.toggleTaskComplete(this.currentTaskId);
          // 标记任务完成后，直接取消选择任务，不触发切换任务弹窗
          window.taskManager.doSelectTask(null);
        }
        modal.classList.add('hidden');
        this.reset();
      });
      
      newCancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }
  }

  // 更新显示
  updateDisplay() {
    if (!this.timerDisplay) return;
    
    // 计算分钟和秒
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    
    // 格式化时间
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // 更新显示
    this.timerDisplay.textContent = formattedTime;
    
    // 更新页面标题
    document.title = `${formattedTime} - Flow Tomato`;
  }

  // 更新状态显示
  updateStatus() {
    if (!this.timerStatus) return;
    
    let statusText = '';
    
    if (!this.isRunning && !this.isPaused) {
      if (this.isBreak) {
        statusText = this.isLongBreak ? '长休息时间' : '短休息时间';
      } else {
        statusText = this.currentTaskId ? '准备开始' : '请选择任务';
      }
    } else if (this.isPaused) {
      statusText = '已暂停';
    } else if (this.isRunning) {
      if (this.isBreak) {
        statusText = this.isLongBreak ? '长休息中' : '休息中';
      } else {
        statusText = '专注中';
      }
    }
    
    this.timerStatus.textContent = statusText;
  }

  // 更新按钮状态
  updateButtonStates() {
    if (!this.startBtn || !this.pauseBtn) return;
    
    if (this.isRunning && !this.isPaused) {
      // 运行中
      this.startBtn.classList.add('hidden');
      this.pauseBtn.classList.remove('hidden');
    } else {
      // 未运行或已暂停
      this.startBtn.classList.remove('hidden');
      this.pauseBtn.classList.add('hidden');
      
      // 更新开始按钮文本
      if (this.isPaused) {
        this.startBtn.textContent = '继续';
      } else {
        this.startBtn.textContent = '开始';
      }
    }
  }
  

}

// 创建全局计时器管理器实例
const timerManager = new TimerManager();