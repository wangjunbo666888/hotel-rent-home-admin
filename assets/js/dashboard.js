/**
 * 房产中介管理系统 - 仪表板页面
 * 处理首页数据展示和统计信息
 */

/**
 * 仪表板管理器
 */
class DashboardManager {
    constructor() {
        this.init();
    }
    
    /**
     * 初始化仪表板
     */
    init() {
        this.loadStatistics();
        this.bindEvents();
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 统计卡片点击事件
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('click', () => {
                this.handleStatCardClick(card);
            });
        });
        
        // 快速操作按钮事件
        const actionButtons = document.querySelectorAll('.action-buttons .btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleActionButtonClick(e, btn);
            });
        });
    }
    
    /**
     * 加载统计数据
     */
    async loadStatistics() {
        try {
            // 模拟加载状态
            this.showLoading();
            
            // 并行获取公寓和房间数据
            const [apartments, rooms] = await Promise.all([
                apartmentApi.getList(),
                roomApi.getList()
            ]);
            
            // 计算统计数据
            const apartmentCount = apartments.length;
            const roomCount = rooms.length;
            const availableCount = rooms.filter(room => room.status === 1).length;
            
            // 计算平均租金
            let totalPrice = 0;
            let priceCount = 0;
            rooms.forEach(room => {
                if (room.rent && room.rent > 0) {
                    totalPrice += parseFloat(room.rent);
                    priceCount++;
                }
            });
            const avgPrice = priceCount > 0 ? totalPrice / priceCount : 0;
            
            const data = {
                apartmentCount,
                roomCount,
                availableCount,
                avgPrice: Math.round(avgPrice * 100) / 100
            };
            
            // 更新统计卡片
            this.updateStatistics(data);
            
            // 隐藏加载状态
            this.hideLoading();
            
        } catch (error) {
            console.error('加载统计数据失败:', error);
            Message.error('加载统计数据失败，请重试');
            this.hideLoading();
        }
    }
    
    /**
     * 更新统计数据显示
     */
    updateStatistics(data) {
        // 更新公寓总数
        const apartmentCountEl = document.getElementById('apartmentCount');
        if (apartmentCountEl) {
            apartmentCountEl.textContent = data.apartmentCount;
            this.animateNumber(apartmentCountEl, 0, data.apartmentCount);
        }
        
        // 更新房间总数
        const roomCountEl = document.getElementById('roomCount');
        if (roomCountEl) {
            roomCountEl.textContent = data.roomCount;
            this.animateNumber(roomCountEl, 0, data.roomCount);
        }
        
        // 更新可租房源数
        const availableCountEl = document.getElementById('availableCount');
        if (availableCountEl) {
            availableCountEl.textContent = data.availableCount;
            this.animateNumber(availableCountEl, 0, data.availableCount);
        }
        
        // 更新平均租金
        const avgPriceEl = document.getElementById('avgPrice');
        if (avgPriceEl) {
            avgPriceEl.textContent = Utils.formatCurrency(data.avgPrice);
            this.animateNumber(avgPriceEl, 0, data.avgPrice, true);
        }
    }
    
    /**
     * 数字动画效果
     */
    animateNumber(element, start, end, isCurrency = false) {
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;
            
            if (isCurrency) {
                element.textContent = Utils.formatCurrency(current);
            } else {
                element.textContent = Math.round(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.classList.add('loading');
        });
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.classList.remove('loading');
        });
    }
    
    /**
     * 处理统计卡片点击
     */
    handleStatCardClick(card) {
        const cardIndex = Array.from(card.parentNode.children).indexOf(card);
        const pages = [
            'pages/apartment/list.html',
            'pages/room/list.html',
            'pages/room/list.html?status=1',
            'pages/room/list.html'
        ];
        
        if (pages[cardIndex]) {
            window.location.href = pages[cardIndex];
        }
    }
    
    /**
     * 处理快速操作按钮点击
     */
    handleActionButtonClick(e, button) {
        // 添加点击反馈效果
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
        
        // 记录操作日志
        const action = button.textContent.trim();
        console.log(`用户点击了: ${action}`);
    }
    
    /**
     * 刷新统计数据
     */
    async refreshStatistics() {
        await this.loadStatistics();
        Message.info('统计数据已刷新');
    }
    
    /**
     * 获取最近活动
     */
    getRecentActivities() {
        const activities = [];
        
        // 从本地存储获取最近的操作记录
        const recentData = Storage.get('recent_activities', []);
        
        // 模拟一些最近活动
        const mockActivities = [
            {
                type: 'apartment',
                action: '新增',
                name: '阳光公寓',
                time: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前
            },
            {
                type: 'room',
                action: '编辑',
                name: 'A栋101室',
                time: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4小时前
            },
            {
                type: 'apartment',
                action: '删除',
                name: '老旧小区',
                time: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6小时前
            }
        ];
        
        return [...recentData, ...mockActivities].slice(0, 10);
    }
    
    /**
     * 显示最近活动
     */
    showRecentActivities() {
        const activities = this.getRecentActivities();
        
        // 这里可以创建一个活动列表组件
        console.log('最近活动:', activities);
    }
}

/**
 * 数据可视化管理器
 */
class ChartManager {
    constructor() {
        this.charts = {};
    }
    
    /**
     * 初始化图表
     */
    init() {
        // 这里可以初始化各种图表
        // 例如：房源状态分布、租金趋势等
        console.log('图表管理器初始化');
    }
    
    /**
     * 创建房源状态分布图
     */
    createStatusChart(containerId, data) {
        // 使用Chart.js创建图表
        const ctx = document.getElementById(containerId);
        if (!ctx) return;
        
        // 这里可以集成Chart.js
        console.log('创建状态分布图:', data);
    }
    
    /**
     * 创建租金趋势图
     */
    createPriceTrendChart(containerId, data) {
        // 使用Chart.js创建趋势图
        const ctx = document.getElementById(containerId);
        if (!ctx) return;
        
        // 这里可以集成Chart.js
        console.log('创建租金趋势图:', data);
    }
}

/**
 * 通知管理器
 */
class NotificationManager {
    constructor() {
        this.notifications = [];
    }
    
    /**
     * 初始化通知
     */
    init() {
        this.loadNotifications();
        this.bindEvents();
    }
    
    /**
     * 加载通知
     */
    loadNotifications() {
        // 从本地存储或API获取通知
        this.notifications = Storage.get('notifications', []);
        
        // 模拟一些通知
        if (this.notifications.length === 0) {
            this.notifications = [
                {
                    id: 1,
                    type: 'info',
                    title: '系统更新',
                    message: '系统已更新到最新版本',
                    time: new Date(),
                    read: false
                },
                {
                    id: 2,
                    type: 'warning',
                    title: '数据备份',
                    message: '建议定期备份重要数据',
                    time: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    read: false
                }
            ];
            
            Storage.set('notifications', this.notifications);
        }
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 这里可以绑定通知相关的事件
    }
    
    /**
     * 显示通知
     */
    showNotification(notification) {
        Message.info(notification.message);
    }
    
    /**
     * 标记通知为已读
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            Storage.set('notifications', this.notifications);
        }
    }
}

/**
 * 初始化仪表板
 */
document.addEventListener('DOMContentLoaded', () => {
    // 初始化仪表板管理器
    window.dashboardManager = new DashboardManager();
    
    // 初始化图表管理器
    window.chartManager = new ChartManager();
    window.chartManager.init();
    
    // 初始化通知管理器
    window.notificationManager = new NotificationManager();
    window.notificationManager.init();
    
    // 添加自动刷新功能
    setInterval(() => {
        // 每5分钟自动刷新一次统计数据
        if (window.dashboardManager) {
            window.dashboardManager.refreshStatistics();
        }
    }, 5 * 60 * 1000);
    
    console.log('仪表板初始化完成');
}); 