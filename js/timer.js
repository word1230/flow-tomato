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
    
    // 初始化显示
    this.updateDisplay();
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

  // 设置当前任务
  setCurrentTask(taskId) {
    this.currentTaskId = taskId;
    
    // 如果计时器正在运行，重置它
    if (this.isRunning) {
      this.reset();
    }
    
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
    
    // 更新按钮状态
    this.updateButtonStates();
    
    // 更新状态显示
    this.updateStatus();
    
    // 启动计时器
    this.timerInterval = setInterval(() => this.tick(), 1000);
  }

  // 暂停计时
  pause() {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    
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
    
    // 更新按钮状态
    this.updateButtonStates();
    
    // 更新状态显示
    this.updateStatus();
    
    // 重新启动计时器
    this.timerInterval = setInterval(() => this.tick(), 1000);
  }

  // 重置计时器
  reset() {
    // 清除计时器
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    
    // 重置状态
    this.isRunning = false;
    this.isPaused = false;
    
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

  // 计时器滴答
  tick() {
    // 减少剩余时间
    this.timeRemaining--;
    
    // 更新显示
    this.updateDisplay();
    
    // 检查时间是否到了
    if (this.timeRemaining <= 0) {
      this.timerComplete();
    }
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
    
    // 检查是否自动开始下一个番茄钟
    const settings = storageManager.getUserSettings();
    if (settings.autoStartBreak) {
      // 自动开始下一个番茄钟
      this.startNextPomodoro();
    } else {
      // 手动开始
      this.reset();
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