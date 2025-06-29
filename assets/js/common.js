/**
 * 房产中介管理系统 - 公共JavaScript
 * 包含通用函数、工具方法和全局配置
 */

/**
 * 全局配置
 */
const CONFIG = {
    // API基础URL（后续连接后端时使用）
    API_BASE_URL: '',
    // 本地存储键名
    STORAGE_KEYS: {
        USER_INFO: 'user_info',
        APARTMENT_DATA: 'apartment_data',
        ROOM_DATA: 'room_data'
    },
    // 分页配置
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
    },
    // 消息提示配置
    MESSAGE: {
        DURATION: 3000,
        POSITION: 'top-right'
    }
};

/**
 * 工具类
 */
class Utils {
    /**
     * 格式化日期
     * @param {Date|string} date - 日期对象或日期字符串
     * @param {string} format - 格式化模式
     * @returns {string} 格式化后的日期字符串
     */
    static formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }
    
    /**
     * 格式化金额
     * @param {number} amount - 金额
     * @param {string} currency - 货币符号
     * @returns {string} 格式化后的金额
     */
    static formatCurrency(amount, currency = '¥') {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return `${currency}0.00`;
        }
        return `${currency}${parseFloat(amount).toFixed(2)}`;
    }
    
    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     * @returns {Function} 防抖后的函数
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 限制时间
     * @returns {Function} 节流后的函数
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * 深拷贝对象
     * @param {*} obj - 要拷贝的对象
     * @returns {*} 拷贝后的对象
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = Utils.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
    
    /**
     * 验证邮箱格式
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否有效
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * 验证手机号格式
     * @param {string} phone - 手机号
     * @returns {boolean} 是否有效
     */
    static isValidPhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }
    
    /**
     * 获取URL参数
     * @param {string} name - 参数名
     * @returns {string|null} 参数值
     */
    static getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    /**
     * 设置URL参数
     * @param {string} name - 参数名
     * @param {string} value - 参数值
     */
    static setUrlParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    }
}

/**
 * 本地存储管理
 */
class Storage {
    /**
     * 设置存储项
     * @param {string} key - 键名
     * @param {*} value - 值
     */
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage set error:', error);
        }
    }
    
    /**
     * 获取存储项
     * @param {string} key - 键名
     * @param {*} defaultValue - 默认值
     * @returns {*} 存储的值
     */
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }
    
    /**
     * 删除存储项
     * @param {string} key - 键名
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    }
    
    /**
     * 清空所有存储
     */
    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    }
}

/**
 * 消息提示管理
 */
class Message {
    /**
     * 显示消息提示
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (success, error, warning, info)
     * @param {number} duration - 显示时长
     */
    static show(message, type = 'info', duration = CONFIG.MESSAGE.DURATION) {
        // 创建消息容器
        let container = document.getElementById('message-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'message-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type} fade-in`;
        messageEl.style.cssText = `
            margin-bottom: 10px;
            padding: 12px 16px;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        // 设置背景色
        const colors = {
            success: '#52c41a',
            error: '#ff4d4f',
            warning: '#faad14',
            info: '#1890ff'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;
        
        // 添加图标
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        messageEl.innerHTML = `
            <span style="font-weight: bold;">${icons[type] || icons.info}</span>
            <span>${message}</span>
        `;
        
        // 添加到容器
        container.appendChild(messageEl);
        
        // 自动移除
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, duration);
    }
    
    /**
     * 成功消息
     */
    static success(message, duration) {
        this.show(message, 'success', duration);
    }
    
    /**
     * 错误消息
     */
    static error(message, duration) {
        this.show(message, 'error', duration);
    }
    
    /**
     * 警告消息
     */
    static warning(message, duration) {
        this.show(message, 'warning', duration);
    }
    
    /**
     * 信息消息
     */
    static info(message, duration) {
        this.show(message, 'info', duration);
    }
}

/**
 * 表单验证
 */
class Validator {
    /**
     * 验证规则
     */
    static rules = {
        required: (value) => value !== null && value !== undefined && value.toString().trim() !== '',
        email: (value) => Utils.isValidEmail(value),
        phone: (value) => Utils.isValidPhone(value),
        minLength: (value, min) => value && value.length >= min,
        maxLength: (value, max) => value && value.length <= max,
        number: (value) => !isNaN(parseFloat(value)) && isFinite(value),
        positive: (value) => parseFloat(value) > 0,
        url: (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        }
    };
    
    /**
     * 验证表单
     * @param {Object} data - 表单数据
     * @param {Object} rules - 验证规则
     * @returns {Object} 验证结果
     */
    static validate(data, rules) {
        const errors = {};
        
        for (const field in rules) {
            const fieldRules = rules[field];
            const value = data[field];
            
            for (const rule of fieldRules) {
                const ruleName = typeof rule === 'string' ? rule : rule.rule;
                const ruleParams = rule.params || [];
                
                if (!this.rules[ruleName]) {
                    console.warn(`Unknown validation rule: ${ruleName}`);
                    continue;
                }
                
                const isValid = this.rules[ruleName](value, ...ruleParams);
                
                if (!isValid) {
                    errors[field] = rule.message || `字段 ${field} 验证失败`;
                    break;
                }
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

/**
 * 页面管理器
 */
class PageManager {
    /**
     * 初始化页面
     */
    static init() {
        this.bindEvents();
        this.setActiveNav();
        this.loadPageData();
    }
    
    /**
     * 绑定事件
     */
    static bindEvents() {
        // 侧边栏切换
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('appSidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                
                // 添加遮罩
                let overlay = document.querySelector('.sidebar-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'sidebar-overlay';
                    document.body.appendChild(overlay);
                }
                
                if (sidebar.classList.contains('active')) {
                    overlay.classList.add('active');
                    overlay.addEventListener('click', () => {
                        sidebar.classList.remove('active');
                        overlay.classList.remove('active');
                    });
                } else {
                    overlay.classList.remove('active');
                }
            });
        }
        
        // 退出按钮
        const logoutBtn = document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('确定要退出系统吗？')) {
                    Storage.clear();
                    window.location.href = 'index.html';
                }
            });
        }
        
        // 导航项点击
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
    
    /**
     * 设置当前活跃导航
     */
    static setActiveNav() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && currentPath.includes(href.replace('.html', ''))) {
                item.classList.add('active');
            }
        });
    }
    
    /**
     * 加载页面数据
     */
    static loadPageData() {
        // 这里可以加载一些全局数据
        console.log('Page data loaded');
    }
}

/**
 * 初始化应用
 */
document.addEventListener('DOMContentLoaded', () => {
    PageManager.init();
    
    // 添加页面切换动画
    document.body.classList.add('page-transition');
    
    // 移除加载动画
    setTimeout(() => {
        document.body.classList.remove('page-transition');
    }, 300);
});

// 导出到全局作用域
window.Utils = Utils;
window.Storage = Storage;
window.Message = Message;
window.Validator = Validator;
window.PageManager = PageManager;
window.CONFIG = CONFIG; 