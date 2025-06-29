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
            district: '',
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
            searchBtn.addEventListener('click', async () => {
                this.currentPage = 1;
                await this.search();
            });
        }
        
        // 重置按钮
        const resetBtn = document.querySelector('.btn-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                await this.resetSearch();
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
            pagination.addEventListener('click', async (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const action = e.target.dataset.action;
                    if (action === 'prev' && this.currentPage > 1) {
                        this.currentPage--;
                        await this.renderTable();
                    } else if (action === 'next' && this.currentPage < this.totalPages) {
                        this.currentPage++;
                        await this.renderTable();
                    } else if (action === 'page') {
                        const page = parseInt(e.target.dataset.page);
                        if (page && page !== this.currentPage) {
                            this.currentPage = page;
                            await this.renderTable();
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
        const table = document.querySelector('.data-table tbody');
        if (table) {
            table.addEventListener('click', (e) => {
                /**
                 * 兼容点击按钮内的图标（<i>标签）时也能正确响应
                 * @param {Event} e - 点击事件
                 */
                const btn = e.target.closest('.btn-edit, .btn-delete, .btn-view');
                if (!btn) return;
                const id = btn.dataset.id;
                if (btn.classList.contains('btn-edit')) {
                    this.editApartment(id);
                } else if (btn.classList.contains('btn-delete')) {
                    this.deleteApartment(id);
                } else if (btn.classList.contains('btn-view')) {
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
        const districtInput = document.querySelector('input[name="district"]');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(async () => {
                this.searchParams.name = searchInput.value;
                this.currentPage = 1;
                await this.search();
            }, 500));
        }

        if (districtInput) {
            districtInput.addEventListener('input', Utils.debounce(async () => {
                this.searchParams.district = districtInput.value;
                this.currentPage = 1;
                await this.search();
            }, 500));
        }
        // 状态筛选
        const statusSelect = document.querySelector('select[name="status"]');
        if (statusSelect) {
            statusSelect.addEventListener('change', async () => {
                this.searchParams.status = statusSelect.value;
                this.currentPage = 1;
                await this.search();
            });
        }
        
        // 租金范围筛选
        const rentMinInput = document.querySelector('input[name="rentMin"]');
        const rentMaxInput = document.querySelector('input[name="rentMax"]');
        
        if (rentMinInput) {
            rentMinInput.addEventListener('input', Utils.debounce(async () => {
                this.searchParams.rentMin = rentMinInput.value;
                this.currentPage = 1;
                await this.search();
            }, 500));
        }
        
        if (rentMaxInput) {
            rentMaxInput.addEventListener('input', Utils.debounce(async () => {
                this.searchParams.rentMax = rentMaxInput.value;
                this.currentPage = 1;
                await this.search();
            }, 500));
        }
    }
    
    /**
     * 加载公寓数据
     */
    async loadApartments() {
        try {
            this.showLoading();
            
            // 从API获取数据
            this.apartments = await apartmentApi.getList();
            
            await this.search();
            this.hideLoading();
            
        } catch (error) {
            console.error('加载公寓数据失败:', error);
            Message.error('加载数据失败，请重试');
            this.hideLoading();
        }
    }
    
    /**
     * 搜索公寓
     */
    async search() {
        this.filteredApartments = this.apartments.filter(apartment => {
            const districtMatch = !this.searchParams.district || 
                apartment.district.toLowerCase().includes(this.searchParams.district.toLowerCase());

            const nameMatch = !this.searchParams.name || 
                apartment.name.toLowerCase().includes(this.searchParams.name.toLowerCase());
            
            const statusMatch = !this.searchParams.status || 
                apartment.status === parseInt(this.searchParams.status);
            
            const rentMinMatch = !this.searchParams.rentMin || 
                apartment.rentMin >= parseFloat(this.searchParams.rentMin);
            
            const rentMaxMatch = !this.searchParams.rentMax || 
                !apartment.rentMax || apartment.rentMax <= parseFloat(this.searchParams.rentMax);
            
            return districtMatch && nameMatch && statusMatch && rentMinMatch && rentMaxMatch;
        });
        
        this.totalItems = this.filteredApartments.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
        }
        
        await this.renderTable();
        this.renderPagination();
        this.updateSearchInfo();
    }
    
    /**
     * 重置搜索
     */
    async resetSearch() {
        this.searchParams = {
            name: '',
            status: '',
            rentMin: '',
            rentMax: ''
        };
        
        // 重置表单
        const form = document.querySelector('.search-form');
        if (form) {
            form.reset();
        }
        
        this.currentPage = 1;
        await this.search();
    }
    
    /**
     * 渲染表格
     */
    async renderTable() {
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
        
        // 先渲染基本数据
        tbody.innerHTML = pageData.map(apartment => `
            <tr data-apartment-id="${apartment.id}">
                <td>${apartment.district}</td>
                <td>${apartment.name}</td>
                <td>${apartment.address}</td>
                <td>${Utils.formatCurrency(apartment.rentMin)} - ${Utils.formatCurrency(apartment.rentMax)}</td>
                <td class="room-count">加载中...</td>
                <td>
                    <span class="status-badge ${apartment.status ? 'active' : 'inactive'}">
                        ${apartment.status ? '启用' : '禁用'}
                    </span>
                </td>
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
        
        // 异步更新房间数量
        await this.updateRoomCounts(pageData);
    }
    
    /**
     * 更新房间数量
     */
    async updateRoomCounts(pageData) {
        try {
            const rooms = await roomApi.getList();
            
            // 为每个公寓计算房间数量
            pageData.forEach(apartment => {
                const roomCount = rooms.filter(room => room.apartment_id === parseInt(apartment.id)).length;
                const roomCountCell = document.querySelector(`tr[data-apartment-id="${apartment.id}"] .room-count`);
                if (roomCountCell) {
                    roomCountCell.textContent = roomCount;
                }
            });
        } catch (error) {
            console.error('获取房间数量失败:', error);
            // 如果获取失败，显示0
            pageData.forEach(apartment => {
                const roomCountCell = document.querySelector(`tr[data-apartment-id="${apartment.id}"] .room-count`);
                if (roomCountCell) {
                    roomCountCell.textContent = '0';
                }
            });
        }
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
    async getRoomCount(apartmentId) {
        try {
            const rooms = await roomApi.getList();
            return rooms.filter(room => room.apartment_id === parseInt(apartmentId)).length;
        } catch (error) {
            console.error('获取房间数量失败:', error);
            return 0;
        }
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
     * @param {string} id - 公寓ID
     */
    async deleteApartment(id) {
        try {
            // 确认删除
            if (!confirm('确定要删除这个公寓吗？此操作不可恢复。')) {
                return;
            }
            
            // 调用API删除公寓
            await apartmentApi.delete(id);
            
            Message.success('公寓删除成功');
            this.loadApartments(); // 重新加载数据
            
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
            
            // 从API获取公寓详情
            this.apartment = await apartmentApi.getDetail(this.apartmentId);
            
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
        const fields = ['district','name', 'address', 'longitude', 'latitude', 'rentMin', 'rentMax'];
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && this.apartment[field] !== undefined) {
                input.value = this.apartment[field];
            }
        });
        
        // 填充费用信息
        const feeFields = ['propertyFee', 'waterFee', 'electricityFee', 'heatingFee', 'internetFee', 'parkingFee'];
        feeFields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && this.apartment[field] !== undefined) {
                input.value = this.apartment[field];
            }
        });
        
        // 填充设施信息
        const facilityFields = ['hasElevator', 'facilities', 'transportation', 'promotion'];
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
            } else if (key.includes('fee') || key.includes('rent') || key.includes('longitude') || key.includes('latitude')) {
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
        // 调用API创建公寓
        const newApartment = await apartmentApi.create(data);
        
        Message.success('公寓创建成功');
        this.goBack();
    }
    
    /**
     * 更新公寓
     */
    async updateApartment(data) {
        // 调用API更新公寓
        await apartmentApi.update(this.apartmentId, data);
        
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