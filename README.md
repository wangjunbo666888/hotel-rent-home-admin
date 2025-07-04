# 房产中介管理系统 - 前端

## 项目概述

这是一个基于HTML、CSS、JavaScript的房产中介管理系统前端项目，现已完成与后端API的对接改造。

## 项目结构

```
rent_home_admin/
├── assets/
│   ├── css/           # 样式文件
│   │   ├── common.css
│   │   ├── layout.css
│   │   ├── apartment.css
│   │   └── room.css
│   └── js/            # JavaScript文件
│       ├── common.js   # 公共工具类
│       ├── api.js      # API服务层（新增）
│       ├── dashboard.js # 仪表板管理
│       ├── apartment.js # 公寓管理
│       └── room.js     # 房间管理
├── pages/             # 页面文件
│   ├── apartment/     # 公寓管理页面
│   │   ├── list.html
│   │   ├── add.html
│   │   └── edit.html
│   └── room/          # 房间管理页面
│       ├── list.html
│       ├── add.html
│       └── edit.html
├── data/              # 本地数据文件（已废弃）
├── index.html         # 主页面
├── test-api.html      # API测试页面（新增）
├── API_TEST.md        # API测试说明（新增）
└── README.md          # 项目说明
```

## 主要功能

### 1. 仪表板
- 显示公寓和房间的统计数据
- 快速操作入口
- 实时数据更新

### 2. 公寓管理
- 公寓列表展示
- 新增公寓
- 编辑公寓信息
- 删除公寓
- 搜索和筛选功能

### 3. 房间管理
- 房间列表展示（支持网格和列表视图）
- 新增房间
- 编辑房间信息
- 删除房间
- 搜索和筛选功能

## API对接改造

### 改造内容

1. **新增API服务层** (`assets/js/api.js`)
   - 统一的HTTP请求处理
   - 公寓和房间API封装
   - 错误处理和响应格式统一

2. **修改数据获取方式**
   - 从本地存储改为API调用
   - 异步数据加载
   - 实时数据更新

3. **优化用户体验**
   - 加载状态显示
   - 错误提示优化
   - 操作反馈改进

### API接口

#### 公寓接口
- `GET /api/apartments` - 获取公寓列表
- `GET /api/apartments/{id}` - 获取公寓详情
- `POST /api/apartments` - 创建公寓
- `PUT /api/apartments/{id}` - 更新公寓
- `DELETE /api/apartments/{id}` - 删除公寓

#### 房间接口
- `GET /api/rooms` - 获取房间列表
- `GET /api/rooms/{id}` - 获取房间详情
- `POST /api/rooms` - 创建房间
- `PUT /api/rooms/{id}` - 更新房间
- `DELETE /api/rooms/{id}` - 删除房间

## 使用说明

### 1. 启动后端服务

确保后端服务在 `http://localhost:8080` 正常运行：

```bash
# 在 rent-home-server 目录下
mvn spring-boot:run
```

### 2. 测试API连接

打开 `test-api.html` 页面进行API连接测试，该页面提供：
- 连接状态检查
- 公寓API测试
- 房间API测试

### 3. 使用管理界面

1. 打开 `index.html` 查看仪表板
2. 访问公寓管理页面进行CRUD操作
3. 访问房间管理页面进行CRUD操作

## 技术特点

### 1. 模块化设计
- 清晰的代码结构
- 功能模块分离
- 易于维护和扩展

### 2. 响应式布局
- 适配不同屏幕尺寸
- 移动端友好
- 现代化UI设计

### 3. 用户体验优化
- 加载状态提示
- 操作反馈及时
- 错误处理完善

### 4. API集成
- 统一的API调用方式
- 完善的错误处理
- 数据实时同步

## 开发说明

### 代码规范
- 使用JSDoc注释
- 统一的命名规范
- 清晰的代码结构

### 浏览器兼容性
- 支持现代浏览器
- ES6+语法支持
- 响应式设计

### 性能优化
- 异步数据加载
- 防抖搜索优化
- 分页加载

## 故障排除

### 常见问题

1. **API连接失败**
   - 检查后端服务是否启动
   - 确认端口配置正确
   - 查看浏览器控制台错误

2. **CORS错误**
   - 确认后端CORS配置
   - 检查请求头设置

3. **数据加载失败**
   - 检查网络连接
   - 查看API响应格式
   - 确认数据库连接

### 调试方法

1. 使用浏览器开发者工具
2. 查看网络请求日志
3. 使用 `test-api.html` 进行API测试
4. 检查后端服务日志

## 后续优化建议

1. **功能增强**
   - 添加数据导出功能
   - 实现批量操作
   - 添加数据可视化

2. **性能优化**
   - 实现数据缓存
   - 添加请求重试机制
   - 优化加载性能

3. **用户体验**
   - 添加操作确认
   - 实现拖拽排序
   - 优化移动端体验

4. **安全性**
   - 添加用户认证
   - 实现权限控制
   - 数据验证增强

## 更新日志

### v2.0.0 (当前版本)
- ✅ 完成API对接改造
- ✅ 新增API服务层
- ✅ 优化数据加载方式
- ✅ 改进用户体验
- ✅ 添加API测试功能

### v1.0.0
- ✅ 基础功能实现
- ✅ 本地数据管理
- ✅ 基础UI界面 