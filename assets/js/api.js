/**
 * 房产中介管理系统 - API服务
 * 统一管理后端接口调用
 */

/**
 * API服务类
 */
class ApiService {
    /**
     * 构造函数
     */
    constructor() {
        // API基础URL
        this.baseURL = 'http://localhost:8080/api';
        
        // 默认请求头
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    
    /**
     * 发送HTTP请求
     * @param {string} url - 请求URL
     * @param {Object} options - 请求选项
     * @returns {Promise} 请求结果
     */
    async request(url, options = {}) {
        try {
            const config = {
                headers: { ...this.defaultHeaders, ...options.headers },
                ...options
            };
            
            const response = await fetch(`${this.baseURL}${url}`, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 检查API响应格式
            if (data.code !== 200) {
                throw new Error(data.message || '请求失败');
            }
            
            return data.data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }
    
    /**
     * GET请求
     * @param {string} url - 请求URL
     * @param {Object} params - 查询参数
     * @returns {Promise} 请求结果
     */
    async get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return this.request(fullUrl, { method: 'GET' });
    }
    
    /**
     * POST请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @returns {Promise} 请求结果
     */
    async post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    /**
     * PUT请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @returns {Promise} 请求结果
     */
    async put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    /**
     * DELETE请求
     * @param {string} url - 请求URL
     * @returns {Promise} 请求结果
     */
    async delete(url) {
        return this.request(url, { method: 'DELETE' });
    }
}

/**
 * 公寓API服务
 */
class ApartmentApi {
    constructor() {
        this.api = new ApiService();
    }
    
    /**
     * 获取公寓列表
     * @returns {Promise<Array>} 公寓列表
     */
    async getList() {
        return this.api.get('/apartments');
    }
    
    /**
     * 获取公寓详情
     * @param {number} id - 公寓ID
     * @returns {Promise<Object>} 公寓详情
     */
    async getDetail(id) {
        return this.api.get(`/apartments/${id}`);
    }
    
    /**
     * 创建公寓
     * @param {Object} data - 公寓数据
     * @returns {Promise<Object>} 创建的公寓
     */
    async create(data) {
        return this.api.post('/apartments', data);
    }
    
    /**
     * 更新公寓
     * @param {number} id - 公寓ID
     * @param {Object} data - 公寓数据
     * @returns {Promise<Object>} 更新后的公寓
     */
    async update(id, data) {
        return this.api.put(`/apartments/${id}`, data);
    }
    
    /**
     * 删除公寓
     * @param {number} id - 公寓ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        return this.api.delete(`/apartments/${id}`);
    }
}

/**
 * 房间API服务
 */
class RoomApi {
    constructor() {
        this.api = new ApiService();
    }
    
    /**
     * 获取房间列表
     * @returns {Promise<Array>} 房间列表
     */
    async getList() {
        return this.api.get('/rooms');
    }
    
    /**
     * 获取房间详情
     * @param {number} id - 房间ID
     * @returns {Promise<Object>} 房间详情
     */
    async getDetail(id) {
        return this.api.get(`/rooms/${id}`);
    }
    
    /**
     * 创建房间
     * @param {Object} data - 房间数据
     * @returns {Promise<Object>} 创建的房间
     */
    async create(data) {
        return this.api.post('/rooms', data);
    }
    
    /**
     * 更新房间
     * @param {number} id - 房间ID
     * @param {Object} data - 房间数据
     * @returns {Promise<Object>} 更新后的房间
     */
    async update(id, data) {
        return this.api.put(`/rooms/${id}`, data);
    }
    
    /**
     * 删除房间
     * @param {number} id - 房间ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        return this.api.delete(`/rooms/${id}`);
    }
}

// 创建全局API实例
const apartmentApi = new ApartmentApi();
const roomApi = new RoomApi(); 