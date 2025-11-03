// Flow Tomato - 任务管理模块

class TaskManager {
  constructor() {
    this.tasks = [];
    this.currentTaskId = null;
    this.taskListElement = null;
    this.currentTaskElement = null;
    this.ideaZoneElement = null;
    this.currentTaskNameElement = null;
    this.ideaZoneTaskNameElement = null;
    this.totalPomodorosElement = null;
    this.newTaskInputElement = null;
  }

  // 初始化任务管理器
  init() {
    // 获取DOM元素
    this.taskListElement = document.getElementById('tasks-list');
    this.currentTaskElement = document.getElementById('current-task-name');
    this.ideaZoneElement = document.getElementById('idea-zone');
    this.currentTaskNameElement = document.getElementById('current-task-name');
    this.ideaZoneTaskNameElement = document.getElementById('idea-zone-task-name');
    this.totalPomodorosElement = document.getElementById('total-pomodoros');
    this.newTaskInputElement = document.getElementById('new-task-input');
    
    // 加载任务
    this.loadTasks();
    
    // 更新总番茄数
    this.updateTotalPomodoros();
    
    // 绑定事件
    this.bindEvents();
  }

  // 绑定事件
  bindEvents() {
    // 新任务输入框事件
    if (this.newTaskInputElement) {
      this.newTaskInputElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const taskTitle = e.target.value.trim();
          if (taskTitle) {
            this.addTask(taskTitle);
            e.target.value = '';
          }
        }
      });
    }
    
    // 思路规划区自动保存
    if (this.ideaZoneElement) {
      let saveTimeout;
      this.ideaZoneElement.addEventListener('input', (e) => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          if (this.currentTaskId) {
            this.updateTaskNotes(this.currentTaskId, e.target.value);
          }
        }, 500); // 500ms后保存
      });
    }
  }

  // 加载任务
  loadTasks() {
    this.tasks = storageManager.getAllTasks();
    this.renderTasks();
  }

  // 渲染任务列表
  renderTasks() {
    if (!this.taskListElement) return;
    
    // 清空任务列表
    this.taskListElement.innerHTML = '';
    
    // 按创建时间倒序排序任务
    const sortedTasks = [...this.tasks].sort((a, b) => {
      // 未完成的任务排在前面
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // 按创建时间倒序
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // 渲染每个任务
    sortedTasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      this.taskListElement.appendChild(taskElement);
    });
  }

  // 创建任务元素
  createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.taskId = task.id;
    
    // 如果是当前任务，添加active类
    if (task.id === this.currentTaskId) {
      li.classList.add('active');
    }
    
    // 如果任务已完成，添加completed类
    if (task.completed) {
      li.classList.add('completed');
    }
    
    // 任务头部
    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';
    
    // 任务标题
    const taskTitle = document.createElement('div');
    taskTitle.className = 'task-title';
    taskTitle.textContent = task.title;
    
    // 任务操作区
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    // 番茄钟数控制
    const pomodorosContainer = document.createElement('div');
    pomodorosContainer.className = 'task-pomodoros';
    
    // 减少番茄数按钮
    const decreasePomodoroBtn = document.createElement('button');
    decreasePomodoroBtn.className = 'pomodoro-control-btn decrease';
    decreasePomodoroBtn.textContent = '-';
    decreasePomodoroBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 防止触发任务选择
      const currentPomodoros = task.estimatedPomodoros || 0;
      if (currentPomodoros > 0) {
        this.updateTaskEstimatedPomodoros(task.id, currentPomodoros - 1);
      }
    });
    
    // 番茄数显示
    const pomodoroCount = document.createElement('span');
    pomodoroCount.className = 'pomodoro-count';
    pomodoroCount.textContent = task.estimatedPomodoros || 0;
    
    // 增加番茄数按钮
    const increasePomodoroBtn = document.createElement('button');
    increasePomodoroBtn.className = 'pomodoro-control-btn increase';
    increasePomodoroBtn.textContent = '+';
    increasePomodoroBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 防止触发任务选择
      const currentPomodoros = task.estimatedPomodoros || 0;
      if (currentPomodoros < 99) {
        this.updateTaskEstimatedPomodoros(task.id, currentPomodoros + 1);
      }
    });
    
    const pomodoroLabel = document.createElement('span');
    pomodoroLabel.textContent = '番茄';
    
    pomodorosContainer.appendChild(decreasePomodoroBtn);
    pomodorosContainer.appendChild(pomodoroCount);
    pomodorosContainer.appendChild(increasePomodoroBtn);
    pomodorosContainer.appendChild(pomodoroLabel);
    
    // 番茄进度 - 始终创建元素，但只在番茄数大于0时显示内容
    const pomodoroProgress = document.createElement('div');
    pomodoroProgress.className = 'pomodoro-progress';
    if (task.estimatedPomodoros > 0) {
      pomodoroProgress.textContent = `(${task.completedPomodoros}/${task.estimatedPomodoros})`;
    }
    pomodorosContainer.appendChild(pomodoroProgress);
    
    // 完成复选框
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', (e) => {
      this.toggleTaskComplete(task.id);
      e.stopPropagation(); // 防止触发任务选择
    });
    
    // 开始番茄按钮
    const startPomodoroBtn = document.createElement('span');
    startPomodoroBtn.className = 'task-start-pomodoro';
    startPomodoroBtn.textContent = '开始番茄';
    startPomodoroBtn.addEventListener('click', (e) => {
      this.selectTask(task.id);
      if (window.timerManager) {
        window.timerManager.start();
      }
      e.stopPropagation(); // 防止触发任务选择
    });
    
    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', (e) => {
      this.deleteTask(task.id);
      e.stopPropagation(); // 防止触发任务选择
    });
    
    taskActions.appendChild(pomodorosContainer);
    taskActions.appendChild(startPomodoroBtn);
    taskActions.appendChild(checkbox);
    taskActions.appendChild(deleteBtn);
    
    taskHeader.appendChild(taskTitle);
    taskHeader.appendChild(taskActions);
    
    li.appendChild(taskHeader);
    
    // 点击任务选择任务
    li.addEventListener('click', (e) => {
      // 如果点击的是番茄控制按钮、复选框、删除按钮或开始番茄按钮，不选择任务
      if (e.target.classList.contains('pomodoro-control-btn') || e.target === pomodoroCount || e.target === checkbox || e.target === deleteBtn || e.target.classList.contains('task-start-pomodoro')) {
        return;
      }
      
      // 如果计时器正在运行且点击的是当前任务，不做任何操作
      if (window.timerManager && window.timerManager.isRunning && task.id === this.currentTaskId) {
        return;
      }
      
      this.selectTask(task.id);
    });
    
    return li;
  }

  // 添加任务
  addTask(title) {
    try {
      const newTask = storageManager.addTask(title);
      this.tasks.push(newTask);
      this.renderTasks();
      return newTask;
    } catch (error) {
      console.error('添加任务失败:', error);
      alert(error.message);
      return null;
    }
  }

  // 更新任务
  updateTask(taskId, updates) {
    try {
      const updatedTask = storageManager.updateTask(taskId, updates);
      
      // 更新本地任务数组
      const taskIndex = this.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = updatedTask;
      }
      
      this.renderTasks();
      return updatedTask;
    } catch (error) {
      console.error('更新任务失败:', error);
      alert(error.message);
      return null;
    }
  }

  // 删除任务
  deleteTask(taskId) {
    if (!confirm('确定要删除这个任务吗？')) {
      return;
    }
    
    try {
      storageManager.deleteTask(taskId);
      
      // 更新本地任务数组
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      
      // 如果删除的是当前任务，取消选择
      if (this.currentTaskId === taskId) {
        this.selectTask(null);
      }
      
      this.renderTasks();
    } catch (error) {
      console.error('删除任务失败:', error);
      alert(error.message);
    }
  }

  // 选择任务
  selectTask(taskId) {
    // 检查计时器是否正在运行
    if (window.timerManager && window.timerManager.isRunning) {
      // 如果选择的是当前任务，不做任何操作
      if (taskId === this.currentTaskId) {
        return;
      }
      
      // 如果选择的是其他任务，显示确认对话框
      if (window.app && window.app.showConfirmDialog) {
        window.app.showConfirmDialog(
          '计时器正在运行中，确定要切换任务吗？当前计时将被重置。',
          (confirmed) => {
            if (confirmed) {
              // 先重置计时器
              if (window.timerManager) {
                window.timerManager.reset();
              }
              // 然后切换任务
              this.doSelectTask(taskId);
            }
          }
        );
        return;
      } else {
        // 如果自定义对话框不可用，使用默认confirm作为后备
        if (!confirm('计时器正在运行中，确定要切换任务吗？当前计时将被重置。')) {
          return;
        }
        // 如果确认，重置计时器并切换任务
        if (window.timerManager) {
          window.timerManager.reset();
        }
      }
    }
    
    // 如果计时器不运行，或者用户确认了切换，则执行任务切换
    this.doSelectTask(taskId);
  }
  
  // 实际执行任务选择
  doSelectTask(taskId) {
    this.currentTaskId = taskId;
    
    // 更新任务列表中的活动状态
    const taskElements = this.taskListElement.querySelectorAll('.task-item');
    taskElements.forEach(element => {
      if (element.dataset.taskId === taskId) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });
    
    // 更新当前任务显示
    const task = taskId ? this.getTask(taskId) : null;
    if (task) {
      if (this.currentTaskNameElement) {
        this.currentTaskNameElement.textContent = task.title;
      }
      
      if (this.ideaZoneTaskNameElement) {
        this.ideaZoneTaskNameElement.textContent = task.title;
      }
      
      // 启用思路规划区并加载内容
      if (this.ideaZoneElement) {
        this.ideaZoneElement.disabled = false;
        this.ideaZoneElement.value = task.notes || '';
      }
    } else {
      if (this.currentTaskNameElement) {
        this.currentTaskNameElement.textContent = '未选择任务';
      }
      
      if (this.ideaZoneTaskNameElement) {
        this.ideaZoneTaskNameElement.textContent = '请选择一个任务';
      }
      
      // 禁用思路规划区并清空内容
      if (this.ideaZoneElement) {
        this.ideaZoneElement.disabled = true;
        this.ideaZoneElement.value = '';
      }
    }
    
    // 通知计时器模块任务已更改
    if (window.timerManager) {
      window.timerManager.setCurrentTaskWithoutReset(taskId);
    }
  }

  // 切换任务完成状态
  toggleTaskComplete(taskId) {
    const task = this.getTask(taskId);
    if (!task) return;
    
    this.updateTask(taskId, { completed: !task.completed });
  }

  // 更新任务预估番茄数
  updateTaskEstimatedPomodoros(taskId, estimatedPomodoros) {
    this.updateTask(taskId, { estimatedPomodoros });
  }

  // 更新任务笔记
  updateTaskNotes(taskId, notes) {
    this.updateTask(taskId, { notes });
  }

  // 增加任务完成番茄数
  incrementTaskPomodoros(taskId) {
    try {
      const result = storageManager.incrementPomodoroCount(taskId);
      
      // 更新本地任务数组
      const taskIndex = this.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = result.task;
      }
      
      // 更新总番茄数
      this.updateTotalPomodoros();
      
      // 重新渲染任务列表
      this.renderTasks();
      
      return result;
    } catch (error) {
      console.error('增加番茄数失败:', error);
      return null;
    }
  }

  // 获取任务
  getTask(taskId) {
    return this.tasks.find(task => task.id === taskId) || null;
  }

  // 获取当前任务
  getCurrentTask() {
    return this.currentTaskId ? this.getTask(this.currentTaskId) : null;
  }

  // 更新总番茄数显示
  updateTotalPomodoros() {
    if (this.totalPomodorosElement) {
      const totalPomodoros = storageManager.getTotalPomodoros();
      this.totalPomodorosElement.textContent = totalPomodoros;
    }
  }

  // 检查任务是否完成所有预估番茄
  isTaskPomodorosCompleted(taskId) {
    const task = this.getTask(taskId);
    if (!task || task.estimatedPomodoros <= 0) {
      return false;
    }
    
    return task.completedPomodoros >= task.estimatedPomodoros;
  }
}

// 创建全局任务管理器实例
const taskManager = new TaskManager();