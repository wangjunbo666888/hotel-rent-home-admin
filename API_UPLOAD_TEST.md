# 文件上传API测试文档

## 概述

本文档描述了房间管理系统中文件上传功能的API接口和使用方法。

## 基础信息

- **基础URL**: `http://localhost:8080`
- **文件存储路径**: `./uploads/`
- **文件访问URL**: `/uploads/`

## API接口

### 1. 上传图片

**接口地址**: `POST /api/upload/image`

**请求参数**:
- `file`: 图片文件 (MultipartFile)

**支持格式**: JPG, JPEG, PNG, WebP
**文件大小限制**: 5MB

**响应示例**:
```json
{
    "code": 200,
    "msg": "success",
    "data": "/uploads/images/2024/01/15/images_abc123.jpg"
}
```

**cURL示例**:
```bash
curl -X POST http://localhost:8080/api/upload/image \
  -F "file=@/path/to/image.jpg"
```

### 2. 上传视频

**接口地址**: `POST /api/upload/video`

**请求参数**:
- `file`: 视频文件 (MultipartFile)

**支持格式**: MP4, AVI, MOV
**文件大小限制**: 50MB

**响应示例**:
```json
{
    "code": 200,
    "msg": "success",
    "data": "/uploads/videos/2024/01/15/videos_def456.mp4"
}
```

**cURL示例**:
```bash
curl -X POST http://localhost:8080/api/upload/video \
  -F "file=@/path/to/video.mp4"
```

### 3. 批量上传图片

**接口地址**: `POST /api/upload/images`

**请求参数**:
- `files`: 图片文件数组 (MultipartFile[])

**响应示例**:
```json
{
    "code": 200,
    "msg": "success",
    "data": [
        "/uploads/images/2024/01/15/images_abc123.jpg",
        "/uploads/images/2024/01/15/images_def456.png"
    ]
}
```

**cURL示例**:
```bash
curl -X POST http://localhost:8080/api/upload/images \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.png"
```

### 4. 删除文件

**接口地址**: `DELETE /api/upload/file`

**请求参数**:
- `fileUrl`: 文件URL (String)

**响应示例**:
```json
{
    "code": 200,
    "msg": "success",
    "data": true
}
```

**cURL示例**:
```bash
curl -X DELETE "http://localhost:8080/api/upload/file?fileUrl=/uploads/images/2024/01/15/images_abc123.jpg"
```

## 错误响应

### 文件格式错误
```json
{
    "code": -1,
    "msg": "不支持的图片格式，支持格式：jpg,jpeg,png,webp",
    "data": null
}
```

### 文件大小超限
```json
{
    "code": -1,
    "msg": "图片文件大小不能超过 5MB",
    "data": null
}
```

### 文件为空
```json
{
    "code": -1,
    "msg": "文件不能为空",
    "data": null
}
```

## 前端集成

### 1. 引入文件上传组件

```html
<!-- 引入样式 -->
<link href="assets/css/fileUpload.css" rel="stylesheet">

<!-- 引入脚本 -->
<script src="assets/js/fileUpload.js"></script>
```

### 2. 初始化图片上传

```javascript
const imageUploadUI = new FileUploadUI({
    container: document.getElementById('imageUploadContainer'),
    maxFiles: 10,
    baseUrl: 'http://localhost:8080'
});
```

### 3. 初始化视频上传

```javascript
const videoUploadUI = new FileUploadUI({
    container: document.getElementById('videoUploadContainer'),
    maxFiles: 3,
    baseUrl: 'http://localhost:8080'
});
```

### 4. 获取上传的文件URL

```javascript
// 获取图片URL列表
const imageUrls = imageUploadUI.getUploadedFiles();

// 获取视频URL列表
const videoUrls = videoUploadUI.getUploadedFiles();
```

## 文件存储结构

```
uploads/
├── images/
│   └── 2024/
│       └── 01/
│           └── 15/
│               ├── images_abc123.jpg
│               └── images_def456.png
└── videos/
    └── 2024/
        └── 01/
            └── 15/
                └── videos_ghi789.mp4
```

## 配置说明

### 后端配置 (application.yml)

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 100MB
      enabled: true

file:
  upload:
    path: ./uploads/
    access-url: /uploads/
    image:
      max-size: 5MB
      allowed-types: jpg,jpeg,png,webp
    video:
      max-size: 50MB
      allowed-types: mp4,avi,mov
```

### 前端配置

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:8080',
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov']
};
```

## 测试页面

访问 `test-upload.html` 页面可以测试文件上传功能：

1. 打开浏览器访问 `http://localhost:8080/test-upload.html`
2. 点击上传区域选择文件或拖拽文件到上传区域
3. 查看上传进度和结果

## 注意事项

1. **文件安全**: 上传的文件会进行格式和大小验证
2. **存储路径**: 确保服务器有足够的磁盘空间
3. **访问权限**: 上传的文件通过静态资源路径访问
4. **文件命名**: 系统会自动生成唯一的文件名避免冲突
5. **目录结构**: 按日期自动创建目录结构便于管理

## 故障排除

### 常见问题

1. **文件上传失败**
   - 检查文件格式是否支持
   - 检查文件大小是否超限
   - 检查服务器磁盘空间

2. **文件无法访问**
   - 检查文件存储路径是否正确
   - 检查静态资源映射配置
   - 检查文件权限

3. **跨域问题**
   - 确保后端已配置CORS
   - 检查前端请求URL是否正确

### 日志查看

查看服务器日志获取详细错误信息：

```bash
# 查看Spring Boot应用日志
tail -f logs/application.log
``` 