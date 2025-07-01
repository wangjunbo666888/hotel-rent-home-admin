/**
 * 文件上传管理器
 * 提供图片和视频上传功能
 */
class FileUploadManager {
    /**
     * 构造函数
     * @param {Object} options 配置选项
     */
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'http://localhost:8080';
        this.maxImageSize = options.maxImageSize || 5 * 1024 * 1024; // 5MB
        this.maxVideoSize = options.maxVideoSize || 50 * 1024 * 1024; // 50MB
        this.allowedImageTypes = options.allowedImageTypes || ['image/jpeg', 'image/png', 'image/webp'];
        this.allowedVideoTypes = options.allowedVideoTypes || ['video/mp4', 'video/avi', 'video/mov'];
        this.onProgress = options.onProgress || function() {};
        this.onSuccess = options.onSuccess || function() {};
        this.onError = options.onError || function() {};
    }

    /**
     * 上传图片文件
     * @param {File} file 图片文件
     * @returns {Promise} 上传结果
     */
    async uploadImage(file) {
        return this.uploadFile(file, '/api/upload/image', 'image');
    }

    /**
     * 上传视频文件
     * @param {File} video 视频文件
     * @returns {Promise} 上传结果
     */
    async uploadVideo(video) {
        return this.uploadFile(video, '/api/upload/video', 'video');
    }

    /**
     * 批量上传图片
     * @param {File[]} files 图片文件数组
     * @returns {Promise} 上传结果
     */
    async uploadImages(files) {
        return this.uploadFiles(files, '/api/upload/images', 'image');
    }

    /**
     * 删除文件
     * @param {string} fileUrl 文件URL
     * @returns {Promise} 删除结果
     */
    async deleteFile(fileUrl) {
        try {
            const response = await $.ajax({
                url: this.baseUrl + '/api/upload/file',
                type: 'DELETE',
                data: { fileUrl: fileUrl },
                dataType: 'json'
            });

            if (response.success) {
                this.onSuccess(response.data, 'delete');
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.onError(error, 'delete');
            throw error;
        }
    }

    /**
     * 上传单个文件
     * @param {File} file 文件
     * @param {string} url 上传URL
     * @param {string} type 文件类型
     * @returns {Promise} 上传结果
     */
    async uploadFile(file, url, type) {
        // 验证文件
        this.validateFile(file, type);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await $.ajax({
                url: this.baseUrl + url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                xhr: () => {
                    const xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener('progress', (evt) => {
                        if (evt.lengthComputable) {
                            const percentComplete = (evt.loaded / evt.total) * 100;
                            this.onProgress(percentComplete, file.name);
                        }
                    }, false);
                    return xhr;
                }
            });

            if (response.code === 200) {
                this.onSuccess(response.data, type);
                return response.data;
            } else {
                throw new Error(response.msg || response.message);
            }
        } catch (error) {
            this.onError(error, type);
            throw error;
        }
    }

    /**
     * 批量上传文件
     * @param {File[]} files 文件数组
     * @param {string} url 上传URL
     * @param {string} type 文件类型
     * @returns {Promise} 上传结果
     */
    async uploadFiles(files, url, type) {
        // 验证所有文件
        files.forEach(file => this.validateFile(file, type));

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await $.ajax({
                url: this.baseUrl + url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json'
            });

            if (response.success) {
                this.onSuccess(response.data, type);
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.onError(error, type);
            throw error;
        }
    }

    /**
     * 验证文件
     * @param {File} file 文件
     * @param {string} type 文件类型
     */
    validateFile(file, type) {
        if (!file) {
            throw new Error('文件不能为空');
        }

        if (type === 'image') {
            if (file.size > this.maxImageSize) {
                throw new Error(`图片文件大小不能超过 ${this.formatFileSize(this.maxImageSize)}`);
            }
            if (!this.allowedImageTypes.includes(file.type)) {
                throw new Error(`不支持的图片格式，支持格式：${this.allowedImageTypes.join(', ')}`);
            }
        } else if (type === 'video') {
            if (file.size > this.maxVideoSize) {
                throw new Error(`视频文件大小不能超过 ${this.formatFileSize(this.maxVideoSize)}`);
            }
            if (!this.allowedVideoTypes.includes(file.type)) {
                throw new Error(`不支持的视频格式，支持格式：${this.allowedVideoTypes.join(', ')}`);
            }
        }
    }

    /**
     * 格式化文件大小
     * @param {number} bytes 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 创建文件预览
     * @param {File} file 文件
     * @returns {Promise<string>} 预览URL
     */
    createPreview(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * 检查文件是否为图片
     * @param {File} file 文件
     * @returns {boolean} 是否为图片
     */
    isImage(file) {
        return file.type.startsWith('image/');
    }

    /**
     * 检查文件是否为视频
     * @param {File} file 文件
     * @returns {boolean} 是否为视频
     */
    isVideo(file) {
        return file.type.startsWith('video/');
    }
}

/**
 * 文件上传UI组件
 * 提供拖拽上传、进度条等UI功能
 */
class FileUploadUI {
    /**
     * 构造函数
     * @param {Object} options 配置选项
     */
    constructor(options = {}) {
        this.container = options.container;
        this.uploadManager = new FileUploadManager(options);
        this.maxFiles = options.maxFiles || 10;
        this.files = [];
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.createHTML();
        this.bindEvents();
    }

    /**
     * 创建HTML结构
     */
    createHTML() {
        this.container.innerHTML = `
            <div class="file-upload-area">
                <div class="file-upload-dropzone" id="dropzone">
                    <div class="file-upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div class="file-upload-text">
                        <p>拖拽文件到此处或点击选择文件</p>
                        <p class="file-upload-hint">支持图片：JPG、PNG、WebP，最大5MB</p>
                        <p class="file-upload-hint">支持视频：MP4、AVI、MOV，最大50MB</p>
                    </div>
                    <input type="file" id="fileInput" multiple accept="image/*,video/*" style="display: none;">
                </div>
                <div class="file-upload-progress" id="progressContainer" style="display: none;">
                    <div class="progress">
                        <div class="progress-bar" id="progressBar" role="progressbar" style="width: 0%"></div>
                    </div>
                    <div class="progress-text" id="progressText">0%</div>
                </div>
                <div class="file-upload-list" id="fileList"></div>
            </div>
        `;

        this.dropzone = this.container.querySelector('#dropzone');
        this.fileInput = this.container.querySelector('#fileInput');
        this.progressContainer = this.container.querySelector('#progressContainer');
        this.progressBar = this.container.querySelector('#progressBar');
        this.progressText = this.container.querySelector('#progressText');
        this.fileList = this.container.querySelector('#fileList');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 点击上传
        this.dropzone.addEventListener('click', () => {
            this.fileInput.click();
        });

        // 文件选择
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // 拖拽上传
        this.dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropzone.classList.add('dragover');
        });

        this.dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.dropzone.classList.remove('dragover');
        });

        this.dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropzone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // 设置上传管理器回调
        this.uploadManager.onProgress = (percent, filename) => {
            this.updateProgress(percent, filename);
        };

        this.uploadManager.onSuccess = (data, type) => {
            this.handleUploadSuccess(data, type);
        };

        this.uploadManager.onError = (error, type) => {
            this.handleUploadError(error, type);
        };
    }

    /**
     * 处理文件
     * @param {FileList} files 文件列表
     */
    handleFiles(files) {
        const fileArray = Array.from(files);
        
        // 检查文件数量限制
        if (this.files.length + fileArray.length > this.maxFiles) {
            alert(`最多只能上传 ${this.maxFiles} 个文件`);
            return;
        }

        fileArray.forEach(file => {
            this.addFile(file);
        });
    }

    /**
     * 添加文件
     * @param {File} file 文件
     */
    addFile(file) {
        const fileItem = {
            file: file,
            id: Date.now() + Math.random(),
            status: 'pending' // pending, uploading, success, error
        };

        this.files.push(fileItem);
        this.renderFileItem(fileItem);
        this.uploadFile(fileItem);
    }

    /**
     * 渲染文件项
     * @param {Object} fileItem 文件项
     */
    renderFileItem(fileItem) {
        const fileElement = document.createElement('div');
        fileElement.className = 'file-item';
        fileElement.id = `file-${fileItem.id}`;
        fileElement.innerHTML = `
            <div class="file-item-info">
                <div class="file-item-icon">
                    ${this.uploadManager.isImage(fileItem.file) ? 
                        '<i class="fas fa-image"></i>' : 
                        '<i class="fas fa-video"></i>'}
                </div>
                <div class="file-item-details">
                    <div class="file-item-name">${fileItem.file.name}</div>
                    <div class="file-item-size">${this.uploadManager.formatFileSize(fileItem.file.size)}</div>
                </div>
                <div class="file-item-status">
                    <span class="status-text">等待上传</span>
                    <button class="btn-remove" onclick="fileUploadUI.removeFile(${fileItem.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="file-item-progress" style="display: none;">
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                </div>
            </div>
        `;

        this.fileList.appendChild(fileElement);
    }

    /**
     * 上传文件
     * @param {Object} fileItem 文件项
     */
    async uploadFile(fileItem) {
        const fileElement = document.getElementById(`file-${fileItem.id}`);
        const statusText = fileElement.querySelector('.status-text');
        const progressBar = fileElement.querySelector('.progress-bar');

        try {
            fileItem.status = 'uploading';
            statusText.textContent = '上传中...';
            fileElement.querySelector('.file-item-progress').style.display = 'block';

            let result;
            if (this.uploadManager.isImage(fileItem.file)) {
                result = await this.uploadManager.uploadImage(fileItem.file);
            } else {
                result = await this.uploadManager.uploadVideo(fileItem.file);
            }

            fileItem.status = 'success';
            fileItem.url = result;
            statusText.textContent = '上传成功';
            statusText.className = 'status-text success';
            progressBar.style.width = '100%';

        } catch (error) {
            fileItem.status = 'error';
            statusText.textContent = '上传失败';
            statusText.className = 'status-text error';
            console.error('文件上传失败:', error);
        }
    }

    /**
     * 移除文件
     * @param {number} fileId 文件ID
     */
    removeFile(fileId) {
        const index = this.files.findIndex(item => item.id === fileId);
        if (index > -1) {
            this.files.splice(index, 1);
            const fileElement = document.getElementById(`file-${fileId}`);
            if (fileElement) {
                fileElement.remove();
            }
        }
    }

    /**
     * 更新进度
     * @param {number} percent 进度百分比
     * @param {string} filename 文件名
     */
    updateProgress(percent, filename) {
        this.progressBar.style.width = percent + '%';
        this.progressText.textContent = Math.round(percent) + '%';
    }

    /**
     * 处理上传成功
     * @param {string} data 上传结果
     * @param {string} type 文件类型
     */
    handleUploadSuccess(data, type) {
        console.log(`${type} 上传成功:`, data);
    }

    /**
     * 处理上传错误
     * @param {Error} error 错误信息
     * @param {string} type 文件类型
     */
    handleUploadError(error, type) {
        console.error(`${type} 上传失败:`, error);
        alert(`文件上传失败: ${error.message}`);
    }

    /**
     * 获取已上传的文件URL列表
     * @returns {string[]} 文件URL列表
     */
    getUploadedFiles() {
        return this.files
            .filter(item => item.status === 'success')
            .map(item => item.url);
    }

    /**
     * 清空所有文件
     */
    clear() {
        this.files = [];
        this.fileList.innerHTML = '';
    }
} 