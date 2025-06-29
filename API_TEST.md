# API接口测试说明

## 概述

本项目已经完成了前端与后端API的对接改造，将原来使用本地数据的代码改为使用真实的API接口。

## 改造内容

### 1. 新增API服务层 (`assets/js/api.js`)

- 创建了统一的API服务类 `ApiService`
- 封装了公寓API服务 `ApartmentApi`
- 封装了房间API服务 `RoomApi`
- 统一处理HTTP请求、错误处理和响应格式

### 2. 修改的JavaScript文件

#### `apartment.js`
- `loadApartments()`: 改为调用 `apartmentApi.getList()`
- `deleteApartment()`: 改为调用 `apartmentApi.delete()`
- `loadApartment()`: 改为调用 `apartmentApi.getDetail()`
- `createApartment()`: 改为调用 `apartmentApi.create()`
- `updateApartment()`: 改为调用 `apartmentApi.update()`

#### `room.js`
- `loadData()`: 改为并行调用 `roomApi.getList()` 和 `apartmentApi.getList()`
- `deleteRoom()`: 改为调用 `roomApi.delete()`
- `loadApartments()`: 改为调用 `apartmentApi.getList()`
- `loadRoom()`: 改为调用 `roomApi.getDetail()`
- `createRoom()`: 改为调用 `roomApi.create()`
- `updateRoom()`: 改为调用 `roomApi.update()`

#### `dashboard.js`
- `loadStatistics()`: 改为调用API获取数据并计算统计信息
- `refreshStatistics()`: 改为异步刷新统计数据

### 3. 修改的HTML文件

所有页面都添加了 `api.js` 的引用：
- `index.html`
- `pages/apartment/list.html`
- `pages/apartment/add.html`
- `pages/apartment/edit.html`
- `pages/room/list.html`
- `pages/room/add.html`
- `pages/room/edit.html`

## 测试步骤

### 1. 确保后端服务运行

```bash
# 在 rent-home-server 目录下
mvn spring-boot:run
```

确保服务在 `http://localhost:8080` 正常运行。

### 2. 测试API连接

打开 `test-api.html` 页面，该页面提供了完整的API测试功能：

- 公寓API测试：获取列表、创建、更新、删除
- 房间API测试：获取列表、创建、更新、删除
- 连接状态检查

### 3. 测试管理界面

1. 打开 `index.html` 查看仪表板数据
2. 访问公寓管理页面测试CRUD操作
3. 访问房间管理页面测试CRUD操作

## API接口说明

### 公寓接口

- `GET /api/apartments` - 获取公寓列表
- `GET /api/apartments/{id}` - 获取公寓详情
- `POST /api/apartments` - 创建公寓
- `PUT /api/apartments/{id}` - 更新公寓
- `DELETE /api/apartments/{id}` - 删除公寓

### 房间接口

- `GET /api/rooms` - 获取房间列表
- `GET /api/rooms/{id}` - 获取房间详情
- `POST /api/rooms` - 创建房间
- `PUT /api/rooms/{id}` - 更新房间
- `DELETE /api/rooms/{id}` - 删除房间

## 注意事项

1. **CORS配置**: 后端已配置允许所有来源的跨域请求
2. **错误处理**: API服务层统一处理网络错误和业务错误
3. **数据格式**: 前端发送的数据格式与后端实体类字段对应
4. **状态管理**: 删除操作后会自动刷新数据列表

## 故障排除

### 常见问题

1. **连接失败**: 检查后端服务是否启动，端口是否正确
2. **CORS错误**: 检查浏览器控制台是否有跨域错误
3. **数据格式错误**: 检查前端发送的数据格式是否符合后端要求
4. **数据库连接**: 确保MySQL数据库正常运行

### 调试方法

1. 打开浏览器开发者工具查看网络请求
2. 查看控制台错误信息
3. 使用 `test-api.html` 页面进行API测试
4. 检查后端日志输出

## 后续优化建议

1. 添加请求拦截器处理统一的loading状态
2. 实现数据缓存机制减少重复请求
3. 添加请求重试机制
4. 实现更完善的错误提示
5. 添加API请求的日志记录 