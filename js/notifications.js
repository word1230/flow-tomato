// Flow Tomato - 通知系统模块

class NotificationManager {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = 'default';
    this.audioContext = null;
    this.notificationSound = null;
  }

  // 初始化通知系统
  async init() {
    // 初始化音频系统
    this.initAudio();
    
    // 检查通知权限
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
    
    return {
      notificationSupported: this.isSupported,
      notificationPermission: this.permission,
      audioSupported: !!this.notificationSound
    };
  }

  // 初始化音频系统
  initAudio() {
    console.log('初始化音频系统');
    try {
      // 创建音频元素
      this.notificationSound = new Audio();
      
      // 设置音频源
      this.notificationSound.src = './assets/sounds/Ringtones.mp3';
      
      // 预加载音频
      this.notificationSound.preload = 'auto';
      
      // 添加事件监听器
      this.notificationSound.addEventListener('canplaythrough', () => {
        console.log('音频文件加载成功');
      });
      
      this.notificationSound.addEventListener('error', (e) => {
        console.error('音频文件加载失败:', e.target.error);
        
        // 尝试根目录的文件
        console.log('尝试根目录文件...');
        this.notificationSound.src = './Ringtones.mp3';
        this.notificationSound.load();
      });
      
      // 加载音频
      this.notificationSound.load();
    } catch (error) {
      console.error('音频系统初始化失败:', error);
      this.notificationSound = null;
    }
  }

  // 播放提示音
  playNotificationSound() {
    console.log('playNotificationSound 被调用');
    console.log('notificationSound 存在:', !!this.notificationSound);
    console.log('声音启用设置:', storageManager.getUserSettings().soundEnabled);
    
    if (!this.notificationSound) {
      console.error('音频文件未加载');
      return;
    }
    
    if (!storageManager.getUserSettings().soundEnabled) {
      console.log('声音功能已禁用');
      return;
    }
    
    try {
      // 重置音频到开始位置
      this.notificationSound.currentTime = 0;
      
      // 创建用户交互的Promise，确保音频可以播放
      const playPromise = this.notificationSound.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('音频播放成功');
        }).catch(error => {
          console.error('播放提示音失败:', error);
          
          // 如果是自动播放策略问题，尝试重新加载并播放
          if (error.name === 'NotAllowedError') {
            console.log('检测到自动播放策略限制，尝试重新加载音频');
            this.notificationSound.load();
            // 添加点击事件监听器，以便下次用户交互时播放
            document.addEventListener('click', () => {
              this.notificationSound.play().catch(e => console.error('重试播放失败:', e));
            }, { once: true });
          }
        });
      }
    } catch (error) {
      console.error('播放提示音异常:', error);
    }
  }

  // 请求通知权限
  async requestNotificationPermission() {
    if (!this.isSupported) {
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }

  // 显示通知
  async showNotification(title, options = {}) {
    console.log('showNotification 被调用');
    console.log('通知支持:', this.isSupported);
    console.log('通知权限:', this.permission);
    console.log('通知设置:', storageManager.getUserSettings().notificationEnabled);
    
    // 检查通知是否启用
    if (!storageManager.getUserSettings().notificationEnabled) {
      console.log('通知功能已禁用');
      return false;
    }
    
    // 检查通知支持
    if (!this.isSupported) {
      console.error('浏览器不支持通知');
      return false;
    }
    
    // 如果没有权限，先请求权限
    if (this.permission !== 'granted') {
      console.log('通知权限未授予，当前权限:', this.permission, '尝试请求权限...');
      const granted = await this.requestNotificationPermission();
      if (!granted) {
        console.error('用户拒绝了通知权限请求');
        return false;
      }
      console.log('通知权限已授予');
    }
    
    try {
      // 创建通知
      const notification = new Notification(title, {
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJTNi40NzcgMjIgMTIgMjJTMjIgMTcuNTIzIDIyIDEyUzE3LjUyMyAyIDEyIDJaTTEyIDIwQzcuNTg5IDIwIDQgMTYuNDExIDQgMTJTNy41ODkgNCA0IDEyUzEwLjU4OSA0IDEyIDRTMjAgNy41ODkgMjAgMTJTMTYuNDExIDIwIDEyIDIwWiIgZmlsbD0iIzQyODVGNCIvPgo8cGF0aCBkPSJNMTMgN0gxMVYxM0wxNi4yIDEzLjlMMTcuMSAxMi4xTDEzIDExLjRWNyIgZmlsbD0iIzQyODVGNCIvPgo8L3N2Zz4K',
        badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJTNi40NzcgMjIgMTIgMjJTMjIgMTcuNTIzIDIyIDEyUzE3LjUyMyAyIDEyIDJaTTEyIDIwQzcuNTg5IDIwIDQgMTYuNDExIDQgMTJTNy41ODkgNCA0IDEyUzEwLjU4OSA0IDEyIDRTMjAgNy41ODkgMjAgMTJTMTYuNDExIDIwIDEyIDIwWiIgZmlsbD0iIzQyODVGNCIvPgo8cGF0aCBkPSJNMTMgN0gxMVYxM0wxNi4yIDEzLjlMMTcuMSAxMi4xTDEzIDExLjRWNyIgZmlsbD0iIzQyODVGNCIvPgo8L3N2Zz4K',
        ...options
      });
      
      console.log('通知创建成功');
      
      // 播放提示音
      this.playNotificationSound();
      
      // 自动关闭通知
      if (options.autoClose !== false) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
      
      return true;
    } catch (error) {
      console.error('显示通知失败:', error);
      return false;
    }
  }

  // 显示工作结束通知
  async showWorkEndNotification(taskTitle) {
    return await this.showNotification('工作时间结束！', {
      body: `任务"${taskTitle}"的工作时间已结束，是时候休息一下了。`,
      tag: 'work-end'
    });
  }

  // 显示休息结束通知
  async showBreakEndNotification() {
    return await this.showNotification('休息时间结束！', {
      body: '休息时间已结束，准备开始下一个番茄钟。',
      tag: 'break-end'
    });
  }

  // 显示任务完成通知
  async showTaskCompleteNotification(taskTitle) {
    return await this.showNotification('任务完成！', {
      body: `恭喜！任务"${taskTitle}"已完成。`,
      tag: 'task-complete'
    });
  }

  // 显示长休息开始通知
  async showLongBreakStartNotification() {
    return await this.showNotification('长休息时间！', {
      body: '已完成4个番茄钟，享受15分钟的长休息吧。',
      tag: 'long-break-start'
    });
  }
}

// 创建全局通知管理器实例
const notificationManager = new NotificationManager();