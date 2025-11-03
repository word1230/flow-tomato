// Flow Tomato - 主应用模块

class App {
  constructor() {
    this.mainApp = null;
    this.userKeyDisplay = null;
    this.logoutBtn = null;
    this.settingsBtn = null;
    this.settingsModal = null;
    this.closeSettingsBtn = null;
    this.confirmDialog = null;
    this.confirmMessage = null;
    this.confirmOkBtn = null;
    this.confirmCancelBtn = null;
    this.confirmCallback = null;
  }

  // 初始化应用
  async init() {
    // 获取DOM元素
    this.mainApp = document.getElementById('main-app');
    this.userKeyDisplay = document.getElementById('user-key-display');
    this.logoutBtn = document.getElementById('logout-btn');
    this.settingsBtn = document.getElementById('settings-btn');
    this.settingsModal = document.getElementById('settings-modal');
    this.closeSettingsBtn = document.getElementById('close-settings-btn');
    
    // 初始化自定义确认对话框
    this.initConfirmDialog();
    
    // 初始化存储管理器
    storageManager.init();
    
    // 直接显示主应用
    this.showMainApp();
    
    // 绑定事件
    this.bindEvents();
    
    // 初始化通知系统
    await notificationManager.init();
    
    // 初始化任务管理器
    taskManager.init();
    
    // 初始化计时器
    timerManager.init();
    
    // 初始化设置
    this.initSettings();
  }

  // 初始化自定义确认对话框
  initConfirmDialog() {
    // 获取确认对话框元素
    this.confirmDialog = document.getElementById('confirm-dialog');
    this.confirmMessage = document.getElementById('confirm-message');
    this.confirmOkBtn = document.getElementById('confirm-ok');
    this.confirmCancelBtn = document.getElementById('confirm-cancel');
    
    // 绑定确认对话框事件
    this.confirmOkBtn.addEventListener('click', () => {
      this.hideConfirmDialog();
      if (this.confirmCallback) {
        const callback = this.confirmCallback;
        this.confirmCallback = null;
        callback(true);
      }
    });
    
    this.confirmCancelBtn.addEventListener('click', () => {
      this.hideConfirmDialog();
      if (this.confirmCallback) {
        const callback = this.confirmCallback;
        this.confirmCallback = null;
        callback(false);
      }
    });
    
    // 点击对话框外部关闭
    this.confirmDialog.addEventListener('click', (e) => {
      if (e.target === this.confirmDialog) {
        this.hideConfirmDialog();
        if (this.confirmCallback) {
          const callback = this.confirmCallback;
          this.confirmCallback = null;
          callback(false);
        }
      }
    });
  }

  // 显示确认对话框
  showConfirmDialog(message, callback) {
    this.confirmMessage.textContent = message;
    this.confirmCallback = callback;
    this.confirmDialog.classList.remove('hidden');
  }

  // 隐藏确认对话框
  hideConfirmDialog() {
    this.confirmDialog.classList.add('hidden');
    // 不要在这里清除回调，因为它可能还在执行中
    // 回调将在执行完成后由调用方清除
  }

  // 绑定事件
  bindEvents() {
    // 登出按钮事件（如果保留）
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => this.logout());
    }
    
    // 设置按钮事件
    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', () => this.showSettingsModal());
    }
    
    // 关闭设置按钮事件
    if (this.closeSettingsBtn) {
      this.closeSettingsBtn.addEventListener('click', () => this.hideSettingsModal());
    }
    
    // 点击设置弹窗外部关闭
    if (this.settingsModal) {
      this.settingsModal.addEventListener('click', (e) => {
        if (e.target === this.settingsModal) {
          this.hideSettingsModal();
        }
      });
    }
  }

  // 登出（可选功能）
  logout() {
    if (confirm('确定要重置所有数据吗？')) {
      // 清除所有数据
      localStorage.clear();
      
      // 重新初始化
      location.reload();
    }
  }

  // 显示主应用
  showMainApp() {
    if (this.mainApp) this.mainApp.classList.remove('hidden');
    
    // 隐藏用户信息区域（可选）
    if (this.userKeyDisplay) {
      this.userKeyDisplay.parentElement.style.display = 'none';
    }
    
    // 重新加载任务数据
    taskManager.loadTasks();
    taskManager.updateTotalPomodoros();
  }

  // 显示设置弹窗
  showSettingsModal() {
    if (this.settingsModal) {
      this.settingsModal.classList.remove('hidden');
      
      // 加载当前设置
      this.loadSettings();
    }
  }

  // 隐藏设置弹窗
  hideSettingsModal() {
    if (this.settingsModal) {
      this.settingsModal.classList.add('hidden');
    }
  }

  // 初始化设置
  initSettings() {
    // 获取设置元素
    const autoStartBreakEl = document.getElementById('auto-start-break');
    const notificationEnabledEl = document.getElementById('notification-enabled');
    const soundEnabledEl = document.getElementById('sound-enabled');
    const testNotificationBtn = document.getElementById('test-notification-btn');
    const testSoundBtn = document.getElementById('test-sound-btn');
    
    if (!autoStartBreakEl || !notificationEnabledEl || !soundEnabledEl) return;
    
    // 绑定设置变更事件
    autoStartBreakEl.addEventListener('change', (e) => {
      storageManager.updateUserSettings({
        autoStartBreak: e.target.checked
      });
    });
    
    notificationEnabledEl.addEventListener('change', (e) => {
      storageManager.updateUserSettings({
        notificationEnabled: e.target.checked
      });
      
      // 如果启用通知，请求通知权限
      if (e.target.checked && notificationManager.permission !== 'granted') {
        notificationManager.requestNotificationPermission();
      }
    });
    
    soundEnabledEl.addEventListener('change', (e) => {
      storageManager.updateUserSettings({
        soundEnabled: e.target.checked
      });
    });
    
    // 绑定测试按钮事件
    if (testNotificationBtn) {
      testNotificationBtn.addEventListener('click', async () => {
        console.log('测试通知按钮被点击');
        console.log('通知权限状态:', notificationManager.permission);
        console.log('通知设置:', storageManager.getUserSettings().notificationEnabled);
        
        // 测试通知
        const result = await notificationManager.showNotification('测试通知', '这是一个测试通知，用于验证通知功能是否正常工作。');
        console.log('通知显示结果:', result);
      });
    }
    
    if (testSoundBtn) {
      testSoundBtn.addEventListener('click', () => {
        console.log('测试提示音按钮被点击');
        console.log('音频支持状态:', !!notificationManager.notificationSound);
        console.log('声音设置:', storageManager.getUserSettings().soundEnabled);
        
        // 测试提示音
        notificationManager.playNotificationSound();
      });
    }
  }

  // 加载设置
  loadSettings() {
    const settings = storageManager.getUserSettings();
    
    // 获取设置元素
    const autoStartBreakEl = document.getElementById('auto-start-break');
    const notificationEnabledEl = document.getElementById('notification-enabled');
    const soundEnabledEl = document.getElementById('sound-enabled');
    
    if (!autoStartBreakEl || !notificationEnabledEl || !soundEnabledEl) return;
    
    // 设置值
    autoStartBreakEl.checked = settings.autoStartBreak;
    notificationEnabledEl.checked = settings.notificationEnabled;
    soundEnabledEl.checked = settings.soundEnabled;
  }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', async () => {
  // 创建应用实例
  window.app = new App();
  
  // 初始化应用
  await window.app.init();
  
  // 将模块实例暴露到全局，以便模块间可以相互调用
  window.storageManager = storageManager;
  window.notificationManager = notificationManager;
  window.taskManager = taskManager;
  window.timerManager = timerManager;
});