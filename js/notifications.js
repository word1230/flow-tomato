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
    // 初始化音频上下文
    this.initAudio();
    
    // 检查通知权限
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
    
    return {
      notificationSupported: this.isSupported,
      notificationPermission: this.permission,
      audioSupported: !!this.audioContext
    };
  }

  // 初始化音频系统
  initAudio() {
    try {
      // 创建音频上下文
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // 创建简单的提示音
      this.createNotificationSound();
    } catch (error) {
      console.error('音频系统初始化失败:', error);
      this.audioContext = null;
    }
  }

  // 创建通知提示音
  createNotificationSound() {
    if (!this.audioContext) return;
    
    // 创建一个简单的提示音
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    // 保存音频节点以便播放
    this.notificationSound = {
      oscillator,
      gainNode,
      duration: 500 // 500毫秒
    };
    
    // 停止振荡器，我们只是保存了配置
    try {
      oscillator.stop();
    } catch (e) {
      // 忽略错误，振荡器可能已经停止
    }
  }

  // 播放提示音
  playNotificationSound() {
    if (!this.audioContext || !storageManager.getUserSettings().soundEnabled) {
      return;
    }
    
    try {
      // 恢复音频上下文（如果被暂停）
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      // 创建新的振荡器和增益节点
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 设置声音参数
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      // 播放声音
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('播放提示音失败:', error);
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
  showNotification(title, options = {}) {
    // 检查通知是否启用
    if (!storageManager.getUserSettings().notificationEnabled) {
      return false;
    }
    
    // 检查通知支持
    if (!this.isSupported || this.permission !== 'granted') {
      return false;
    }
    
    try {
      // 创建通知
      const notification = new Notification(title, {
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJTNi40NzcgMjIgMTIgMjJTMjIgMTcuNTIzIDIyIDEyUzE3LjUyMyAyIDEyIDJaTTEyIDIwQzcuNTg5IDIwIDQgMTYuNDExIDQgMTJTNy41ODkgNCA0IDEyUzEwLjU4OSA0IDEyIDRTMjAgNy41ODkgMjAgMTJTMTYuNDExIDIwIDEyIDIwWiIgZmlsbD0iIzQyODVGNCIvPgo8cGF0aCBkPSJNMTMgN0gxMVYxM0wxNi4yIDEzLjlMMTcuMSAxMi4xTDEzIDExLjRWNyIgZmlsbD0iIzQyODVGNCIvPgo8L3N2Zz4K',
        badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJTNi40NzcgMjIgMTIgMjJTMjIgMTcuNTIzIDIyIDEyUzE3LjUyMyAyIDEyIDJaTTEyIDIwQzcuNTg5IDIwIDQgMTYuNDExIDQgMTJTNy41ODkgNCA0IDEyUzEwLjU4OSA0IDEyIDRTMjAgNy41ODkgMjAgMTJTMTYuNDExIDIwIDEyIDIwWiIgZmlsbD0iIzQyODVGNCIvPgo8cGF0aCBkPSJNMTMgN0gxMVYxM0wxNi4yIDEzLjlMMTcuMSAxMi4xTDEzIDExLjRWNyIgZmlsbD0iIzQyODVGNCIvPgo8L3N2Zz4K',
        ...options
      });
      
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
  showWorkEndNotification(taskTitle) {
    return this.showNotification('工作时间结束！', {
      body: `任务"${taskTitle}"的工作时间已结束，是时候休息一下了。`,
      tag: 'work-end'
    });
  }

  // 显示休息结束通知
  showBreakEndNotification() {
    return this.showNotification('休息时间结束！', {
      body: '休息时间已结束，准备开始下一个番茄钟。',
      tag: 'break-end'
    });
  }

  // 显示任务完成通知
  showTaskCompleteNotification(taskTitle) {
    return this.showNotification('任务完成！', {
      body: `恭喜！任务"${taskTitle}"已完成。`,
      tag: 'task-complete'
    });
  }

  // 显示长休息开始通知
  showLongBreakStartNotification() {
    return this.showNotification('长休息时间！', {
      body: '已完成4个番茄钟，享受15分钟的长休息吧。',
      tag: 'long-break-start'
    });
  }
}

// 创建全局通知管理器实例
const notificationManager = new NotificationManager();