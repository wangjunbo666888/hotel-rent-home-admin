/**
 * 房产中介管理系统 - 房间管理
 * 包含房间列表、新增、编辑、删除等功能
 */

/**
 * 房间管理器
 */
class RoomManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
        this.totalPages = 0;
        this.totalItems = 0;
        this.rooms = [];
        this.filteredRooms = [];
        this.apartments = [];
        this.searchParams = {
            roomNumber: '',
            apartmentId: '',
            status: '',
            rentMin: '',
            rentMax: ''
        };
        
        this.init();
    }
    
    /**
     * 初始化房间管理器
     */
    init() {
        this.loadData();
        this.bindEvents();
        this.setupSearch();
    }
    
    /**
     * 加载数据
     */
    async loadData() {
        try {
            this.showLoading();
            
            // 加载房间数据
            this.rooms = Storage.get(CONFIG.STORAGE_KEYS.ROOM_DATA, []);
            if (this.rooms.length === 0) {
                await this.loadMockRoomData();
            }
            
            // 加载公寓数据
            this.apartments = Storage.get(CONFIG.STORAGE_KEYS.APARTMENT_DATA, []);
            if (this.apartments.length === 0) {
                await this.loadMockApartmentData();
            }
            
            this.search();
            this.hideLoading();
            
        } catch (error) {
            console.error('加载数据失败:', error);
            Message.error('加载数据失败，请重试');
            this.hideLoading();
        }
    }
    
    /**
     * 加载模拟房间数据
     */
    async loadMockRoomData() {
        try {
            const response = await fetch('data/rooms.json');
            this.rooms = await response.json();
            Storage.set(CONFIG.STORAGE_KEYS.ROOM_DATA, this.rooms);
        } catch (error) {
            console.error('加载模拟房间数据失败:', error);
            this.rooms = this.getDefaultRoomData();
            Storage.set(CONFIG.STORAGE_KEYS.ROOM_DATA, this.rooms);
        }
    }
    
    /**
     * 加载模拟公寓数据
     */
    async loadMockApartmentData() {
        try {
            const response = await fetch('data/apartments.json');
            this.apartments = await response.json();
            Storage.set(CONFIG.STORAGE_KEYS.APARTMENT_DATA, this.apartments);
        } catch (error) {
            console.error('加载模拟公寓数据失败:', error);
            this.apartments = this.getDefaultApartmentData();
            Storage.set(CONFIG.STORAGE_KEYS.APARTMENT_DATA, this.apartments);
        }
    }
    
    /**
     * 获取默认房间数据
     */
    getDefaultRoomData() {
        return [
            {
                id: 1,
                apartment_id: 1,
                room_number: "A101",
                floor: 1,
                area: 45.5,
                rent: 3500,
                deposit: 7000,
                status: 1,
                description: "朝南主卧，采光好，家具齐全",
                facilities: ["空调", "热水器", "洗衣机"],
                create_time: "2024-01-15 10:30:00"
            },
            {
                id: 2,
                apartment_id: 1,
                room_number: "A102",
                floor: 1,
                area: 38.0,
                rent: 3200,
                deposit: 6400,
                status: 0,
                description: "朝北次卧，安静舒适",
                facilities: ["空调", "热水器"],
                create_time: "2024-01-10 14:20:00"
            },
            {
                id: 3,
                apartment_id: 2,
                room_number: "B201",
                floor: 2,
                area: 52.0,
                rent: 4500,
                deposit: 9000,
                status: 1,
                description: "大户型主卧，带阳台",
                facilities: ["空调", "热水器", "洗衣机", "冰箱"],
                create_time: "2024-01-12 09:15:00"
            }
        ];
    }
    
    /**
     * 获取默认公寓数据
     */
    getDefaultApartmentData() {
        return [
            {
                id: 1,
                name: "阳光公寓",
                address: "北京市朝阳区建国门外大街1号"
            },
            {
                id: 2,
                name: "翠湖花园",
                address: "北京市海淀区中关村大街2号"
            }
        ];
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 搜索按钮
        const searchBtn = document.querySelector('.btn-room-search');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.currentPage = 1;
                this.search();
            });
        }
        
        // 重置按钮
        const resetBtn = document.querySelector('.btn-room-reset');
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
        
        // 视图切换按钮
        this.bindViewToggleEvents();
        
        // 房间卡片事件
        this.bindRoomCardEvents();
    }
    
    /**
     * 绑定视图切换事件
     */
    bindViewToggleEvents() {
        const viewToggle = document.querySelector('.view-toggle');
        if (viewToggle) {
            viewToggle.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const view = e.target.dataset.view;
                    this.switchView(view);
                }
            });
        }
    }
    
    /**
     * 绑定房间卡片事件
     */
    bindRoomCardEvents() {
        const roomGrid = document.querySelector('.room-grid');
        if (roomGrid) {
            roomGrid.addEventListener('click', (e) => {
                const target = e.target;
                if (target.classList.contains('btn-room-view')) {
                    const id = target.dataset.id;
                    this.viewRoom(id);
                } else if (target.classList.contains('btn-room-edit')) {
                    const id = target.dataset.id;
                    this.editRoom(id);
                } else if (target.classList.contains('btn-room-delete')) {
                    const id = target.dataset.id;
                    this.deleteRoom(id);
                }
            });
        }
    }
    
    /**
     * 设置搜索功能
     */
    setupSearch() {
        // 房间号搜索
        const roomNumberInput = document.querySelector('input[name="roomNumber"]');
        if (roomNumberInput) {
            roomNumberInput.addEventListener('input', Utils.debounce(() => {
                this.searchParams.roomNumber = roomNumberInput.value;
                this.currentPage = 1;
                this.search();
            }, 500));
        }
        
        // 公寓筛选
        const apartmentSelect = document.querySelector('select[name="apartmentId"]');
        if (apartmentSelect) {
            apartmentSelect.addEventListener('change', () => {
                this.searchParams.apartmentId = apartmentSelect.value;
                this.currentPage = 1;
                this.search();
            });
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
     * 搜索房间
     */
    search() {
        this.filteredRooms = this.rooms.filter(room => {
            // 房间号搜索
            if (this.searchParams.roomNumber && !room.room_number.toLowerCase().includes(this.searchParams.roomNumber.toLowerCase())) {
                return false;
            }
            
            // 公寓筛选
            if (this.searchParams.apartmentId && room.apartment_id !== parseInt(this.searchParams.apartmentId)) {
                return false;
            }
            
            // 状态筛选
            if (this.searchParams.status && room.status !== parseInt(this.searchParams.status)) {
                return false;
            }
            
            // 租金范围筛选
            if (this.searchParams.rentMin && room.rent < parseFloat(this.searchParams.rentMin)) {
                return false;
            }
            
            if (this.searchParams.rentMax && room.rent > parseFloat(this.searchParams.rentMax)) {
                return false;
            }
            
            return true;
        });
        
        this.totalItems = this.filteredRooms.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        
        this.renderRooms();
        this.updateSearchInfo();
    }
    
    /**
     * 重置搜索
     */
    resetSearch() {
        this.searchParams = {
            roomNumber: '',
            apartmentId: '',
            status: '',
            rentMin: '',
            rentMax: ''
        };
        
        // 重置表单
        const searchForm = document.querySelector('.room-search-form');
        if (searchForm) {
            searchForm.reset();
        }
        
        this.currentPage = 1;
        this.search();
        Message.info('搜索条件已重置');
    }
    
    /**
     * 切换视图
     */
    switchView(view) {
        const buttons = document.querySelectorAll('.view-toggle button');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = document.querySelector(`[data-view="${view}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.currentView = view;
        this.renderRooms();
    }
    
    /**
     * 渲染房间
     */
    renderRooms() {
        const roomGrid = document.querySelector('.room-grid');
        if (!roomGrid) return;
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredRooms.slice(startIndex, endIndex);
        
        if (pageData.length === 0) {
            roomGrid.innerHTML = `
                <div class="room-empty-state">
                    <i class="fas fa-search"></i>
                    <h3>暂无数据</h3>
                    <p>没有找到符合条件的房间信息</p>
                </div>
            `;
            return;
        }
        
        roomGrid.innerHTML = pageData.map(room => {
            const apartment = this.apartments.find(apt => apt.id === room.apartment_id);
            const apartmentName = apartment ? apartment.name : '未知公寓';
            
            return `
                <div class="room-card">
                    <div class="room-card-header">
                        <h3 class="room-card-title">${room.room_number}</h3>
                        <p class="room-card-subtitle">${apartmentName}</p>
                    </div>
                    
                    <div class="room-card-body">
                        <div class="room-info-grid">
                            <div class="room-info-item">
                                <span class="room-info-label">楼层</span>
                                <span class="room-info-value">${room.floor}层</span>
                            </div>
                            <div class="room-info-item">
                                <span class="room-info-label">面积</span>
                                <span class="room-info-value">${room.area}㎡</span>
                            </div>
                            <div class="room-info-item">
                                <span class="room-info-label">租金</span>
                                <span class="room-info-value price">¥${room.rent}/月</span>
                            </div>
                            <div class="room-info-item">
                                <span class="room-info-label">押金</span>
                                <span class="room-info-value">¥${room.deposit}</span>
                            </div>
                        </div>
                        
                        <div class="room-info-item">
                            <span class="room-info-label">状态</span>
                            <span class="room-status ${this.getStatusClass(room.status)}">
                                ${this.getStatusText(room.status)}
                            </span>
                        </div>
                        
                        ${room.description ? `
                            <div class="room-info-item" style="margin-top: var(--spacing-md);">
                                <span class="room-info-label">描述</span>
                                <span class="room-info-value">${room.description}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="room-card-footer">
                        <div class="room-actions">
                            <button class="btn-room-action btn-room-view" data-id="${room.id}" title="查看">
                                <i class="fas fa-eye"></i>
                                查看
                            </button>
                            <button class="btn-room-action btn-room-edit" data-id="${room.id}" title="编辑">
                                <i class="fas fa-edit"></i>
                                编辑
                            </button>
                            <button class="btn-room-action btn-room-delete" data-id="${room.id}" title="删除">
                                <i class="fas fa-trash"></i>
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * 获取状态样式类
     */
    getStatusClass(status) {
        switch (status) {
            case 1: return 'available';
            case 0: return 'rented';
            case 2: return 'maintenance';
            default: return 'available';
        }
    }
    
    /**
     * 获取状态文本
     */
    getStatusText(status) {
        switch (status) {
            case 1: return '可租';
            case 0: return '已租';
            case 2: return '维护';
            default: return '可租';
        }
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
     * 跳转到新增页面
     */
    goToAdd() {
        window.location.href = 'add.html';
    }
    
    /**
     * 编辑房间
     */
    editRoom(id) {
        window.location.href = `edit.html?id=${id}`;
    }
    
    /**
     * 查看房间详情
     */
    viewRoom(id) {
        window.location.href = `view.html?id=${id}`;
    }
    
    /**
     * 删除房间
     */
    async deleteRoom(id) {
        if (!confirm('确定要删除这个房间吗？删除后无法恢复。')) {
            return;
        }
        
        try {
            // 删除房间
            this.rooms = this.rooms.filter(room => room.id !== parseInt(id));
            Storage.set(CONFIG.STORAGE_KEYS.ROOM_DATA, this.rooms);
            
            Message.success('房间删除成功');
            this.search();
            
        } catch (error) {
            console.error('删除房间失败:', error);
            Message.error('删除失败，请重试');
        }
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        let overlay = document.querySelector('.room-loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'room-loading-overlay';
            overlay.innerHTML = '<div class="room-loading-spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const overlay = document.querySelector('.room-loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

/**
 * 房间表单管理器
 */
class RoomFormManager {
    constructor() {
        this.roomId = Utils.getUrlParam('id');
        this.isEdit = !!this.roomId;
        this.room = null;
        this.apartments = [];
        
        this.init();
    }
    
    /**
     * 初始化表单管理器
     */
    init() {
        this.loadApartments();
        this.bindEvents();
        this.setupValidation();
        
        if (this.isEdit) {
            this.loadRoom();
        }
    }
    
    /**
     * 加载公寓数据
     */
    async loadApartments() {
        try {
            this.apartments = Storage.get(CONFIG.STORAGE_KEYS.APARTMENT_DATA, []);
            this.renderApartmentOptions();
        } catch (error) {
            console.error('加载公寓数据失败:', error);
        }
    }
    
    /**
     * 渲染公寓选项
     */
    renderApartmentOptions() {
        const apartmentSelect = document.querySelector('select[name="apartment_id"]');
        if (apartmentSelect) {
            apartmentSelect.innerHTML = '<option value="">请选择公寓</option>' +
                this.apartments.map(apt => 
                    `<option value="${apt.id}">${apt.name} - ${apt.address}</option>`
                ).join('');
        }
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        const form = document.getElementById('roomForm');
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
        
        // 设施选择
        this.bindFacilityEvents();
        
        // 状态选择
        this.bindStatusEvents();
        
        // 图片上传
        const imageUpload = document.querySelector('.room-image-upload');
        if (imageUpload) {
            imageUpload.addEventListener('click', () => {
                this.openImageUpload();
            });
        }
    }
    
    /**
     * 绑定设施选择事件
     */
    bindFacilityEvents() {
        const facilityItems = document.querySelectorAll('.room-facility-item');
        facilityItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    item.classList.toggle('selected', checkbox.checked);
                });
            }
        });
    }
    
    /**
     * 绑定状态选择事件
     */
    bindStatusEvents() {
        const statusOptions = document.querySelectorAll('.room-status-option');
        statusOptions.forEach(option => {
            option.addEventListener('click', () => {
                statusOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                const input = document.querySelector('input[name="status"]');
                if (input) {
                    input.value = option.dataset.status;
                }
            });
        });
    }
    
    /**
     * 设置表单验证
     */
    setupValidation() {
        const requiredFields = ['room_number', 'apartment_id', 'floor', 'area', 'rent'];
        
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
        const errorEl = field.parentNode.querySelector('.room-form-error');
        if (errorEl) {
            errorEl.remove();
        }
        
        // 验证规则
        let isValid = true;
        let errorMessage = '';
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = '此字段为必填项';
        } else if (fieldName === 'room_number' && value.length < 2) {
            isValid = false;
            errorMessage = '房间号至少需要2个字符';
        } else if (fieldName === 'floor' && (isNaN(value) || value < 1)) {
            isValid = false;
            errorMessage = '楼层必须是大于0的数字';
        } else if (fieldName === 'area' && (isNaN(value) || value <= 0)) {
            isValid = false;
            errorMessage = '面积必须是大于0的数字';
        } else if (fieldName === 'rent' && (isNaN(value) || value <= 0)) {
            isValid = false;
            errorMessage = '租金必须是大于0的数字';
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
        errorEl.className = 'room-form-error';
        errorEl.textContent = message;
        field.parentNode.appendChild(errorEl);
    }
    
    /**
     * 验证整个表单
     */
    validateForm() {
        const form = document.getElementById('roomForm');
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
     * 加载房间数据
     */
    async loadRoom() {
        try {
            this.showLoading();
            
            const rooms = Storage.get(CONFIG.STORAGE_KEYS.ROOM_DATA, []);
            this.room = rooms.find(room => room.id === parseInt(this.roomId));
            
            if (!this.room) {
                Message.error('房间不存在');
                this.goBack();
                return;
            }
            
            this.fillForm();
            this.hideLoading();
            
        } catch (error) {
            console.error('加载房间数据失败:', error);
            Message.error('加载数据失败，请重试');
            this.hideLoading();
        }
    }
    
    /**
     * 填充表单
     */
    fillForm() {
        const form = document.getElementById('roomForm');
        if (!form || !this.room) return;
        
        // 填充基本信息
        const fields = ['room_number', 'apartment_id', 'floor', 'area', 'rent', 'deposit', 'description'];
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && this.room[field] !== undefined) {
                input.value = this.room[field];
            }
        });
        
        // 填充状态
        const statusInput = form.querySelector('input[name="status"]');
        if (statusInput) {
            statusInput.value = this.room.status;
            const statusOption = document.querySelector(`[data-status="${this.room.status}"]`);
            if (statusOption) {
                statusOption.classList.add('selected');
            }
        }
        
        // 填充设施
        if (this.room.facilities) {
            this.room.facilities.forEach(facility => {
                const checkbox = form.querySelector(`input[value="${facility}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.closest('.room-facility-item').classList.add('selected');
                }
            });
        }
        
        // 更新页面标题
        const title = document.querySelector('.page-title');
        if (title) {
            title.textContent = `编辑房间 - ${this.room.room_number}`;
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
                await this.updateRoom(formData);
            } else {
                await this.createRoom(formData);
            }
            
            this.hideLoading();
            
        } catch (error) {
            console.error('保存房间失败:', error);
            Message.error('保存失败，请重试');
            this.hideLoading();
        }
    }
    
    /**
     * 获取表单数据
     */
    getFormData() {
        const form = document.getElementById('roomForm');
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (key === 'facilities') {
                if (!data.facilities) data.facilities = [];
                data.facilities.push(value);
            } else if (key.includes('floor') || key.includes('area') || key.includes('rent') || key.includes('deposit')) {
                data[key] = value ? parseFloat(value) : null;
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }
    
    /**
     * 创建房间
     */
    async createRoom(data) {
        const rooms = Storage.get(CONFIG.STORAGE_KEYS.ROOM_DATA, []);
        
        const newRoom = {
            id: Utils.generateId(),
            ...data,
            apartment_id: parseInt(data.apartment_id),
            status: parseInt(data.status),
            create_time: Utils.formatDate(new Date()),
            update_time: Utils.formatDate(new Date())
        };
        
        rooms.push(newRoom);
        Storage.set(CONFIG.STORAGE_KEYS.ROOM_DATA, rooms);
        
        Message.success('房间创建成功');
        this.goBack();
    }
    
    /**
     * 更新房间
     */
    async updateRoom(data) {
        const rooms = Storage.get(CONFIG.STORAGE_KEYS.ROOM_DATA, []);
        const index = rooms.findIndex(room => room.id === parseInt(this.roomId));
        
        if (index === -1) {
            Message.error('房间不存在');
            return;
        }
        
        rooms[index] = {
            ...rooms[index],
            ...data,
            apartment_id: parseInt(data.apartment_id),
            status: parseInt(data.status),
            update_time: Utils.formatDate(new Date())
        };
        
        Storage.set(CONFIG.STORAGE_KEYS.ROOM_DATA, rooms);
        
        Message.success('房间更新成功');
        this.goBack();
    }
    
    /**
     * 打开图片上传
     */
    openImageUpload() {
        // 这里可以集成图片上传功能
        Message.info('图片上传功能开发中...');
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
 * 初始化房间管理
 */
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('list.html')) {
        // 房间列表页面
        window.roomManager = new RoomManager();
    } else if (currentPath.includes('add.html') || currentPath.includes('edit.html')) {
        // 房间表单页面
        window.roomFormManager = new RoomFormManager();
    }
}); 