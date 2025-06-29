/**
 * 房产中介管理系统 - 公寓管理
 * 包含公寓列表、新增、编辑、删除等功能
 */

/**
 * 公寓管理器
 */
class ApartmentManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
        this.totalPages = 0;
        this.totalItems = 0;
        this.apartments = [];
        this.filteredApartments = [];
        this.searchParams = {
            name: '',
            status: '',
            rentMin: '',
            rentMax: ''
        };
        
        this.init();
    }
    
    /**
     * 初始化公寓管理器
     */
    init() {
        this.loadApartments();
        this.bindEvents();
        this.setupSearch();
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 搜索按钮
        const searchBtn = document.querySelector('.btn-search');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.currentPage = 1;
                this.search();
            });
        }
        
        // 重置按钮
        const resetBtn = document.querySelector('.btn-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSearch();
            });
        }
        
        // 新增按钮
        const addBtn = document.querySelector('.btn-add');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.goToAdd();
            });
        }
        
        // 分页按钮
        this.bindPaginationEvents();
        
        // 表格操作按钮
        this.bindTableEvents();
    }
    
    /**
     * 绑定分页事件
     */
    bindPaginationEvents() {
        const pagination = document.querySelector('.pagination');
        if (pagination) {
            pagination.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const action = e.target.dataset.action;
                    if (action === 'prev' && this.currentPage > 1) {
                        this.currentPage--;
                        this.renderTable();
                    } else if (action === 'next' && this.currentPage < this.totalPages) {
                        this.currentPage++;
                        this.renderTable();
                    } else if (action === 'page') {
                        const page = parseInt(e.target.dataset.page);
                        if (page && page !== this.currentPage) {
                            this.currentPage = page;
                            this.renderTable();
                        }
                    }
                }
            });
        }
    }
    
    /**
     * 绑定表格事件
     */
    bindTableEvents() {
        const table = document.querySelector('.data-table');
        if (table) {
            table.addEventListener('click', (e) => {
                const target = e.target;
                if (target.classList.contains('btn-edit')) {
                    const id = target.dataset.id;
                    this.editApartment(id);
                } else if (target.classList.contains('btn-delete')) {
                    const id = target.dataset.id;
                    this.deleteApartment(id);
                } else if (target.classList.contains('btn-view')) {
                    const id = target.dataset.id;
                    this.viewApartment(id);
                }
            });
        }
    }
    
    /**
     * 设置搜索功能
     */
    setupSearch() {
        // 搜索输入框防抖
        const searchInput = document.querySelector('input[name="name"]');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.searchParams.name = searchInput.value;
                this.currentPage = 1;
                this.search();
            }, 500));
        }
        
        // 状态筛选
        const statusSelect = document.querySelector('select[name="status"]');
        if (statusSelect) {
            statusSelect.addEventListener('change', () => {
                this.searchParams.status = statusSelect.value;
                this.currentPage = 1;
                this.search();
            });
        }
        
        // 租金范围筛选
        const rentMinInput = document.querySelector('input[name="rentMin"]');
        const rentMaxInput = document.querySelector('input[name="rentMax"]');
        
        if (rentMinInput) {
            rentMinInput.addEventListener('input', Utils.debounce(() => {
                this.searchParams.rentMin = rentMinInput.value;
                this.currentPage = 1;
                this.search();
            }, 500));
        }
        
        if (rentMaxInput) {
            rentMaxInput.addEventListener('input', Utils.debounce(() => {
                this.searchParams.rentMax = rentMaxInput.value;
                this.currentPage = 1;
                this.search();
            }, 500));
        }
    }
    
    /**
     * 加载公寓数据
     */
    async loadApartments() {
        try {
            this.showLoading();
            
            // 从本地存储获取数据
            this.apartments = Storage.get(CONFIG.STORAGE_KEYS.APARTMENT_DATA, []);
            
            // 如果没有数据，加载模拟数据
            if (this.apartments.length === 0) {
                await this.loadMockData();
            }
            
            this.search();
            this.hideLoading();
            
        } catch (error) {
            console.error('加载公寓数据失败:', error);
            Message.error('加载数据失败，请重试');
            this.hideLoading();
        }
    }
    
    /**
     * 加载模拟数据
     */
    async loadMockData() {
        try {
            const response = await fetch('data/apartments.json');
            this.apartments = await response.json();
            Storage.set(CONFIG.STORAGE_KEYS.APARTMENT_DATA, this.apartments);
        } catch (error) {
            console.error('加载模拟数据失败:', error);
            // 如果无法加载JSON文件，使用默认数据
            this.apartments = this.getDefaultData();
            Storage.set(CONFIG.STORAGE_KEYS.APARTMENT_DATA, this.apartments);
        }
    }
    
    /**
     * 获取默认数据
     */
    getDefaultData() {
        return [
            {
                id: 1,
                name: "阳光公寓",
                address: "北京市朝阳区建国门外大街1号",
                rent_min: 3000,
                rent_max: 8000,
                status: 1,
                create_time: "2024-01-15 10:30:00"
            },
            {
                id: 2,
                name: "翠湖花园",
                address: "北京市海淀区中关村大街2号",
                rent_min: 4000,
                rent_max: 12000,
                status: 1,
                create_time: "2024-01-10 14:20:00"
            }
        ];
    }
    
    /**
     * 搜索公寓
     */
    search() {
        this.filteredApartments = this.apartments.filter(apartment => {
            // 名称搜索
            if (this.searchParams.name && !apartment.name.toLowerCase().includes(this.searchParams.name.toLowerCase())) {
                return false;
            }
            
            // 状态筛选
            if (this.searchParams.status && apartment.status !== parseInt(this.searchParams.status)) {
                return false;
            }
            
            // 租金范围筛选
            if (this.searchParams.rentMin && apartment.rent_min < parseFloat(this.searchParams.rentMin)) {
                return false;
            }
            
            if (this.searchParams.rentMax && apartment.rent_max > parseFloat(this.searchParams.rentMax)) {
                return false;
            }
            
            return true;
        });
        
        this.totalItems = this.filteredApartments.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        
        this.renderTable();
        this.renderPagination();
        this.updateSearchInfo();
    }
    
    /**
     * 重置搜索
     */
    resetSearch() {
        this.searchParams = {
            name: '',
            status: '',
            rentMin: '',
            rentMax: ''
        };
        
        // 重置表单
        const searchForm = document.querySelector('.search-form');
        if (searchForm) {
            searchForm.reset();
        }
        
        this.currentPage = 1;
        this.search();
        Message.info('搜索条件已重置');
    }
    
    /**
     * 渲染表格
     */
    renderTable() {
        const tbody = document.querySelector('.data-table tbody');
        if (!tbody) return;
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredApartments.slice(startIndex, endIndex);
        
        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>暂无数据</h3>
                        <p>没有找到符合条件的公寓信息</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = pageData.map(apartment => `
            <tr>
                <td>${apartment.name}</td>
                <td>${apartment.address}</td>
                <td>${Utils.formatCurrency(apartment.rent_min)} - ${Utils.formatCurrency(apartment.rent_max)}</td>
                <td>${this.getRoomCount(apartment.id)}</td>
                <td>
                    <span class="status-badge ${apartment.status ? 'active' : 'inactive'}">
                        ${apartment.status ? '启用' : '禁用'}
                    </span>
                </td>
                <td>${Utils.formatDate(apartment.create_time, 'YYYY-MM-DD')}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-view" data-id="${apartment.id}" title="查看">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-edit" data-id="${apartment.id}" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" data-id="${apartment.id}" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    /**
     * 渲染分页
     */
    renderPagination() {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;
        
        if (this.totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // 上一页按钮
        paginationHTML += `
            <button ${this.currentPage === 1 ? 'disabled' : ''} data-action="prev">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // 页码按钮
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="${i === this.currentPage ? 'current' : ''}" data-action="page" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        // 下一页按钮
        paginationHTML += `
            <button ${this.currentPage === this.totalPages ? 'disabled' : ''} data-action="next">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }
    
    /**
     * 更新搜索信息
     */
    updateSearchInfo() {
        const infoEl = document.querySelector('.pagination-info');
        if (infoEl) {
            const startItem = (this.currentPage - 1) * this.pageSize + 1;
            const endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);
            infoEl.textContent = `显示第 ${startItem} - ${endItem} 条，共 ${this.totalItems} 条记录`;
        }
    }
    
    /**
     * 获取公寓的房间数量
     */
    getRoomCount(apartmentId) {
        const rooms = Storage.get(CONFIG.STORAGE_KEYS.ROOM_DATA, []);
        return rooms.filter(room => room.apartment_id === apartmentId).length;
    }
    
    /**
     * 跳转到新增页面
     */
    goToAdd() {
        window.location.href = 'add.html';
    }
    
    /**
     * 编辑公寓
     */
    editApartment(id) {
        window.location.href = `edit.html?id=${id}`;
    }
    
    /**
     * 查看公寓详情
     */
    viewApartment(id) {
        window.location.href = `view.html?id=${id}`;
    }
    
    /**
     * 删除公寓
     */
    async deleteApartment(id) {
        if (!confirm('确定要删除这个公寓吗？删除后无法恢复。')) {
            return;
        }
        
        try {
            // 检查是否有房间关联
            const rooms = Storage.get(CONFIG.STORAGE_KEYS.ROOM_DATA, []);
            const relatedRooms = rooms.filter(room => room.apartment_id === parseInt(id));
            
            if (relatedRooms.length > 0) {
                Message.warning(`该公寓下还有 ${relatedRooms.length} 个房间，请先删除或转移房间`);
                return;
            }
            
            // 删除公寓
            this.apartments = this.apartments.filter(apartment => apartment.id !== parseInt(id));
            Storage.set(CONFIG.STORAGE_KEYS.APARTMENT_DATA, this.apartments);
            
            Message.success('公寓删除成功');
            this.search();
            
        } catch (error) {
            console.error('删除公寓失败:', error);
            Message.error('删除失败，请重试');
        }
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        let overlay = document.querySelector('.loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

/**
 * 公寓表单管理器
 */
class ApartmentFormManager {
    constructor() {
        this.apartmentId = Utils.getUrlParam('id');
        this.isEdit = !!this.apartmentId;
        this.apartment = null;
        
        this.init();
    }
    
    /**
     * 初始化表单管理器
     */
    init() {
        this.bindEvents();
        this.setupValidation();
        
        if (this.isEdit) {
            this.loadApartment();
        }
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        const form = document.getElementById('apartmentForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
        
        // 取消按钮
        const cancelBtn = document.querySelector('.btn-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.goBack();
            });
        }
        
        // 地图选择器
        const mapSelector = document.querySelector('.map-selector');
        if (mapSelector) {
            mapSelector.addEventListener('click', () => {
                this.openMapSelector();
            });
        }
    }
    
    /**
     * 设置表单验证
     */
    setupValidation() {
        const requiredFields = ['name', 'address'];
        
        requiredFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('blur', () => {
                    this.validateField(field);
                });
            }
        });
    }
    
    /**
     * 验证字段
     */
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        
        // 移除之前的验证状态
        field.classList.remove('is-valid', 'is-invalid');
        
        // 清除错误信息
        const errorEl = field.parentNode.querySelector('.form-error');
        if (errorEl) {
            errorEl.remove();
        }
        
        // 验证规则
        let isValid = true;
        let errorMessage = '';
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = '此字段为必填项';
        } else if (fieldName === 'name' && value.length < 2) {
            isValid = false;
            errorMessage = '公寓名称至少需要2个字符';
        } else if (fieldName === 'address' && value.length < 5) {
            isValid = false;
            errorMessage = '地址至少需要5个字符';
        }
        
        // 应用验证结果
        if (isValid) {
            field.classList.add('is-valid');
        } else {
            field.classList.add('is-invalid');
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    /**
     * 显示字段错误
     */
    showFieldError(field, message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'form-error';
        errorEl.textContent = message;
        field.parentNode.appendChild(errorEl);
    }
    
    /**
     * 验证整个表单
     */
    validateForm() {
        const form = document.getElementById('apartmentForm');
        if (!form) return false;
        
        const fields = form.querySelectorAll('[required]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    /**
     * 加载公寓数据
     */
    async loadApartment() {
        try {
            this.showLoading();
            
            const apartments = Storage.get(CONFIG.STORAGE_KEYS.APARTMENT_DATA, []);
            this.apartment = apartments.find(apt => apt.id === parseInt(this.apartmentId));
            
            if (!this.apartment) {
                Message.error('公寓不存在');
                this.goBack();
                return;
            }
            
            this.fillForm();
            this.hideLoading();
            
        } catch (error) {
            console.error('加载公寓数据失败:', error);
            Message.error('加载数据失败，请重试');
            this.hideLoading();
        }
    }
    
    /**
     * 填充表单
     */
    fillForm() {
        const form = document.getElementById('apartmentForm');
        if (!form || !this.apartment) return;
        
        // 填充基本信息
        const fields = ['name', 'address', 'longitude', 'latitude', 'rent_min', 'rent_max'];
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && this.apartment[field] !== undefined) {
                input.value = this.apartment[field];
            }
        });
        
        // 填充费用信息
        const feeFields = ['property_fee', 'water_fee', 'electricity_fee', 'heating_fee', 'internet_fee', 'parking_fee'];
        feeFields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && this.apartment[field] !== undefined) {
                input.value = this.apartment[field];
            }
        });
        
        // 填充设施信息
        const facilityFields = ['has_elevator', 'facilities', 'transportation', 'promotion'];
        facilityFields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && this.apartment[field] !== undefined) {
                if (input.type === 'checkbox') {
                    input.checked = this.apartment[field] === 1;
                } else {
                    input.value = this.apartment[field];
                }
            }
        });
        
        // 更新页面标题
        const title = document.querySelector('.page-title');
        if (title) {
            title.textContent = `编辑公寓 - ${this.apartment.name}`;
        }
    }
    
    /**
     * 处理表单提交
     */
    async handleSubmit() {
        if (!this.validateForm()) {
            Message.error('请检查表单填写是否正确');
            return;
        }
        
        try {
            this.showLoading();
            
            const formData = this.getFormData();
            
            if (this.isEdit) {
                await this.updateApartment(formData);
            } else {
                await this.createApartment(formData);
            }
            
            this.hideLoading();
            
        } catch (error) {
            console.error('保存公寓失败:', error);
            Message.error('保存失败，请重试');
            this.hideLoading();
        }
    }
    
    /**
     * 获取表单数据
     */
    getFormData() {
        const form = document.getElementById('apartmentForm');
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (key === 'has_elevator') {
                data[key] = value === 'on' ? 1 : 0;
            } else if (key.includes('_fee') || key.includes('rent_') || key.includes('longitude') || key.includes('latitude')) {
                data[key] = value ? parseFloat(value) : null;
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }
    
    /**
     * 创建公寓
     */
    async createApartment(data) {
        const apartments = Storage.get(CONFIG.STORAGE_KEYS.APARTMENT_DATA, []);
        
        const newApartment = {
            id: Utils.generateId(),
            ...data,
            status: 1,
            create_time: Utils.formatDate(new Date()),
            update_time: Utils.formatDate(new Date())
        };
        
        apartments.push(newApartment);
        Storage.set(CONFIG.STORAGE_KEYS.APARTMENT_DATA, apartments);
        
        Message.success('公寓创建成功');
        this.goBack();
    }
    
    /**
     * 更新公寓
     */
    async updateApartment(data) {
        const apartments = Storage.get(CONFIG.STORAGE_KEYS.APARTMENT_DATA, []);
        const index = apartments.findIndex(apt => apt.id === parseInt(this.apartmentId));
        
        if (index === -1) {
            Message.error('公寓不存在');
            return;
        }
        
        apartments[index] = {
            ...apartments[index],
            ...data,
            update_time: Utils.formatDate(new Date())
        };
        
        Storage.set(CONFIG.STORAGE_KEYS.APARTMENT_DATA, apartments);
        
        Message.success('公寓更新成功');
        this.goBack();
    }
    
    /**
     * 打开地图选择器
     */
    openMapSelector() {
        // 这里可以集成地图API
        Message.info('地图选择功能开发中...');
    }
    
    /**
     * 返回上一页
     */
    goBack() {
        window.history.back();
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        const submitBtn = document.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
        }
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const submitBtn = document.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = this.isEdit ? '更新' : '创建';
        }
    }
}

/**
 * 初始化公寓管理
 */
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('list.html')) {
        // 公寓列表页面
        window.apartmentManager = new ApartmentManager();
    } else if (currentPath.includes('add.html') || currentPath.includes('edit.html')) {
        // 公寓表单页面
        window.apartmentFormManager = new ApartmentFormManager();
    }
}); 