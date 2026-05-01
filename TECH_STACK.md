# 情侣旅行回忆分享网站技术方案 v1.0

## 1. 技术方案结论

项目第一版采用前后端分离架构：

```text
前端：Vue 3 + Vite + TypeScript
3D 地球：CesiumJS
状态管理：Pinia
路由：Vue Router
UI：Tailwind CSS + shadcn-vue 或 Naive UI
后端：FastAPI + Pydantic + SQLAlchemy 2.0
数据库：PostgreSQL
迁移：Alembic
认证：JWT + Refresh Token
媒体：第一版本地上传目录，后续迁移对象存储
部署：Docker Compose + Nginx
```

该方案适合本项目的核心特点：桌面端沉浸式 3D 体验、复杂内容模型、后续 PostgreSQL 持久化、私有站点部署，以及未来扩展为多情侣社区。

## 2. 架构概览

```text
Browser
  |
  |-- Vue 3 Web App
  |     |-- CesiumJS 3D Globe
  |     |-- City / Trip / Memory / Anniversary Pages
  |     |-- Content Management UI
  |
  |-- REST API
        |
        |-- FastAPI Backend
              |-- Auth Service
              |-- Couple Service
              |-- City Service
              |-- Trip Service
              |-- Memory Service
              |-- Anniversary Service
              |-- Media Service
              |-- Share Service
              |-- Stats Service
              |-- Tag Service
              |
              |-- PostgreSQL
              |-- Local Media Storage
```

第一版前端可先使用 Mock 数据完成页面和交互，后端接口和 PostgreSQL 逐步接入。数据结构需要从一开始就按真实后端模型设计，避免后期迁移成本过高。

## 3. 前端技术选型

### 3.1 Vue 3

使用 Vue 3 作为前端框架，原因如下：

1. 组件化能力成熟，适合拆分 3D 地球、城市详情、旅行详情、回忆详情、纪念日和内容管理模块。
2. Composition API 适合封装地图、相机飞行、内容编辑、上传等复杂逻辑。
3. 与 Vite、TypeScript、Pinia、Vue Router 生态配合稳定。
4. 对前后端分离项目友好，适合调用 FastAPI 提供的 REST API。

### 3.2 Vite

使用 Vite 作为构建工具，原因如下：

1. 本地开发启动快。
2. 对 Vue 3 和 TypeScript 支持成熟。
3. 适合管理 CesiumJS 这类较重的前端依赖。
4. 构建产物可作为静态资源部署到 Nginx、CDN 或对象存储。

### 3.3 TypeScript

前端必须使用 TypeScript。

主要收益：

1. 城市、旅行、回忆、内容块、纪念日、标签等模型较多，TypeScript 可降低字段误用风险。
2. 方便与后端 OpenAPI schema 对齐。
3. 有利于后续扩展多人社区、权限和对象存储等能力。

### 3.4 Pinia

使用 Pinia 做状态管理。

适合管理：

1. 当前登录用户。
2. 当前情侣关系。
3. 城市、旅行、回忆、纪念日缓存。
4. 低性能模式开关。
5. 内容管理草稿状态。
6. 全站搜索状态。

### 3.5 Vue Router

使用 Vue Router 管理页面路由。

建议核心路由：

```text
/                       首页 3D 地球
/cities/:cityId         城市详情
/trips/:tripId          旅行详情
/memories/:memoryId     回忆详情
/anniversaries          纪念日页面
/community              公共社区大厅占位
/manage                 内容管理入口
/login                  登录
/register               注册
/share/:shareToken      分享访问入口
```

### 3.6 UI 方案

推荐优先级：

1. `Tailwind CSS + shadcn-vue`
2. `Naive UI`

推荐使用 `Tailwind CSS + shadcn-vue`，原因是：

1. 更适合定制沉浸式、浪漫感、杂志感页面。
2. 可以更自由地实现粉色光晕、玻璃态、主题切换和内容卡片。
3. 组件粒度轻，适合长期维护。

如果更希望快速搭建内容管理区，可在管理页面局部引入 Naive UI，但不建议整站同时混用两套视觉体系。

### 3.7 动效方案

推荐：

```text
GSAP + VueUse Motion
```

使用场景：

1. 页面转场。
2. 回忆详情页滚动动效。
3. 纪念日倒计时卡片动效。
4. 城市卡片、旅行时间线、主题切换动效。

Cesium 地球相机飞行应优先使用 Cesium 自身 Camera API，而不是用普通 DOM 动效模拟。

## 4. 3D 地球与地图方案

### 4.1 CesiumJS

3D 地球使用 CesiumJS。

选择原因：

1. CesiumJS 原生面向真实数字地球场景。
2. 支持经纬度点位、相机飞行、影像图层、地形、标签和实体。
3. 更适合实现从全球视角飞到城市近景的体验。
4. 比 Three.js 更适合本项目的真实地理坐标体系。

### 4.2 首页地球能力

首页地球第一版实现：

1. 地球旋转、缩放、拖拽。
2. 10 多个城市点位。
3. 粉色发光圆点。
4. 城市名称标签。
5. 点击城市点位后执行相机飞行。
6. 飞行结束后进入城市详情页。
7. 低性能模式。

### 4.3 城市详情地图

城市详情页顶部保留真实地图近景。

可选方案：

1. 继续使用 CesiumJS 作为城市近景地图。
2. 使用 Mapbox GL JS 作为城市详情页地图。
3. 使用国内地图服务作为后续增强。

第一版建议继续使用 CesiumJS，减少地图技术栈数量。如果后续需要更成熟的城市 POI、地图搜索和样式控制，再引入 Mapbox 或国内地图服务。

### 4.4 地图搜索

新增城市时需要通过地图搜索选择城市并自动填充坐标。

第一版可先使用内置城市 Mock 列表完成：

```text
城市名
国家/省份
经度
纬度
封面图
```

后续接入地图 Geocoding API，例如 Mapbox Geocoding、高德地图、天地图或其他服务。

## 5. 后端技术选型

### 5.1 FastAPI

后端使用 FastAPI。

选择原因：

1. 性能好，适合 REST API 服务。
2. Pydantic 数据校验能力强。
3. 自动生成 OpenAPI 文档，前后端联调效率高。
4. 模块化路由清晰，适合拆分城市、旅行、回忆、纪念日等业务域。
5. Python 生态适合后续做媒体处理、图片分析、AI 能力扩展。

### 5.2 Pydantic

使用 Pydantic 定义请求和响应 schema。

适用场景：

1. 登录注册参数校验。
2. 城市、旅行、回忆、纪念日创建和更新。
3. 内容块结构校验。
4. 分享权限校验。
5. 统计数据响应。

### 5.3 SQLAlchemy 2.0

使用 SQLAlchemy 2.0 作为 ORM。

选择原因：

1. 适合 PostgreSQL 关系模型。
2. 支持复杂关联关系。
3. 社区成熟，长期维护风险低。
4. 与 Alembic 数据迁移配合稳定。

### 5.4 Alembic

使用 Alembic 做数据库迁移。

要求：

1. 所有表结构变更必须通过 migration 管理。
2. 开发环境和生产环境保持同一迁移路径。
3. 重要字段如状态、软删除、分享权限需要在初始模型中预留。

## 6. 数据库方案

数据库使用 PostgreSQL。

核心表建议：

```text
users
couples
couple_members
cities
trips
trip_cities
memories
memory_blocks
anniversaries
tags
tag_relations
shares
visit_stats
media_assets
trash_records
```

### 6.1 核心实体关系

1. 一个 couple 包含两个 user。
2. 一个 couple 拥有多个 city。
3. 一个 couple 拥有多个 trip。
4. 一个 trip 可关联多个 city。
5. 一个 city 可关联多个 memory。
6. 一个 memory 可包含多个 memory_block。
7. 一个 anniversary 可关联 city、trip 或 memory，也可以单独存在。
8. tag 可关联 city、trip、memory、anniversary 或 memory_block。
9. share 控制城市、回忆、旅行、纪念日的分享开放状态。
10. visit_stats 记录聚合访问数据。

### 6.2 通用字段

主要业务表建议包含：

```text
id
couple_id
title / name
status              draft / published
visibility          private / shared
sort_order
is_pinned
deleted_at
created_at
updated_at
```

### 6.3 内容块模型

回忆详情页采用内容块模型：

```text
memory_blocks
  id
  memory_id
  type              text / image / video / audio_placeholder / bgm_placeholder
  content
  media_asset_id
  occurred_at
  weather
  mood_emoji
  sort_order
  metadata
```

该模型方便实现图文视频按时间顺序穿插展示，也方便后续扩展语音、BGM 和内容块级权限。

## 7. 认证与权限

### 7.1 登录注册

第一版支持：

1. 邮箱注册登录。
2. 手机号注册登录接口预留。
3. 第三方登录 UI 预留。

建议认证方式：

```text
Access Token + Refresh Token
```

Access Token 用于 API 鉴权，Refresh Token 用于续期。

### 7.2 情侣绑定

第一版推荐实现邀请码绑定：

1. 用户 A 创建情侣空间。
2. 系统生成邀请码。
3. 用户 B 输入邀请码。
4. 系统建立 couple_members 关系。

手机号/邮箱搜索并确认作为后续增强。

### 7.3 访客权限

访客无需登录即可访问分享链接。

访问规则：

1. 仅可查看已发布内容。
2. 仅可查看分享开放内容。
3. 不可访问搜索。
4. 不可访问内容管理。
5. 不可访问草稿和回收站内容。

## 8. 媒体存储方案

### 8.1 第一版

第一版使用后端本地上传目录：

```text
uploads/
  images/
  videos/
  covers/
```

FastAPI 提供媒体上传接口，并返回媒体访问 URL。

第一版不做：

1. 图片压缩。
2. 视频转码。
3. 缩略图生成。
4. CDN 分发。

### 8.2 后续扩展

后续迁移至对象存储：

```text
阿里云 OSS
腾讯云 COS
Cloudflare R2
AWS S3
MinIO
```

media_assets 表需要提前预留：

```text
storage_provider
bucket
object_key
public_url
mime_type
size
duration
width
height
metadata
```

## 9. API 模块设计

后端建议拆分以下路由：

```text
/api/auth
/api/couples
/api/cities
/api/trips
/api/memories
/api/anniversaries
/api/tags
/api/media
/api/shares
/api/stats
/api/search
/api/trash
```

### 9.1 典型接口示例

```text
GET    /api/cities
POST   /api/cities
GET    /api/cities/{city_id}
PATCH  /api/cities/{city_id}
DELETE /api/cities/{city_id}
POST   /api/cities/{city_id}/restore

GET    /api/memories/{memory_id}
POST   /api/memories
PATCH  /api/memories/{memory_id}
DELETE /api/memories/{memory_id}

GET    /api/anniversaries
POST   /api/anniversaries
PATCH  /api/anniversaries/{anniversary_id}
DELETE /api/anniversaries/{anniversary_id}

POST   /api/media/upload
GET    /api/share/{share_token}
POST   /api/stats/view
GET    /api/search?q=
```

## 10. 前端页面模块

建议目录结构：

```text
web/
  src/
    api/
    assets/
    components/
      globe/
      map/
      memory/
      trip/
      anniversary/
      manage/
      layout/
    pages/
      HomeGlobe.vue
      CityDetail.vue
      TripDetail.vue
      MemoryDetail.vue
      Anniversaries.vue
      CommunityPreview.vue
      ContentManage.vue
      Login.vue
      Register.vue
    stores/
    types/
    utils/
```

### 10.1 Globe 模块

```text
components/globe/
  CesiumGlobe.vue
  CityMarkerLayer.vue
  CityLabelLayer.vue
  GlobeControls.vue
  PerformanceModeToggle.vue
```

### 10.2 内容模块

```text
components/memory/
  MemoryCard.vue
  MemoryTimeline.vue
  MemoryBlockRenderer.vue
  MemoryThemeProvider.vue
```

### 10.3 管理模块

```text
components/manage/
  ManageLayout.vue
  CityEditor.vue
  TripEditor.vue
  MemoryEditor.vue
  AnniversaryEditor.vue
  TagSelector.vue
  TrashPanel.vue
```

## 11. 部署方案

第一版推荐 Docker Compose + Nginx：

```text
nginx
  |-- serve Vue static files
  |-- reverse proxy /api to FastAPI
  |-- serve /uploads media files

fastapi
  |-- uvicorn app.main:app

postgres
  |-- PostgreSQL database
```

### 11.1 生产部署组件

```text
Nginx
Vue static build
FastAPI + Uvicorn
PostgreSQL
Local uploads volume
```

### 11.2 环境变量

建议环境变量：

```text
DATABASE_URL
JWT_SECRET
JWT_ACCESS_TOKEN_EXPIRE_MINUTES
JWT_REFRESH_TOKEN_EXPIRE_DAYS
UPLOAD_DIR
PUBLIC_MEDIA_BASE_URL
CESIUM_ION_TOKEN
MAP_PROVIDER
MAP_API_KEY
```

## 12. 开发阶段建议

### 12.1 第一阶段：前端原型

目标：

1. Vue 项目初始化。
2. 首页 Cesium 地球。
3. Mock 城市点位。
4. 城市飞行聚焦。
5. 城市详情、回忆详情、旅行详情、纪念日页面静态版。

### 12.2 第二阶段：内容管理 Mock

目标：

1. 内容管理入口。
2. 城市、旅行、回忆、纪念日 Mock CRUD。
3. 草稿/发布、分享、回收站状态。
4. 搜索和标签 Mock。

### 12.3 第三阶段：后端与数据库

目标：

1. FastAPI 项目初始化。
2. PostgreSQL 表结构。
3. 登录注册。
4. 情侣绑定。
5. 城市、旅行、回忆、纪念日 API。
6. 访问统计 API。

### 12.4 第四阶段：媒体与部署

目标：

1. 图片/视频上传。
2. 本地媒体托管。
3. Docker Compose。
4. Nginx 反向代理。
5. 私有站点上线。

## 13. 风险与应对

### 13.1 Cesium 体积与性能

风险：CesiumJS 资源较重，低性能设备可能卡顿。

应对：

1. 首页按需加载 Cesium。
2. 提供低性能模式。
3. 减少同时渲染的 Entity 数量。
4. 第一版仅显示 10 多个城市点，不渲染路线。

### 13.2 地图服务依赖

风险：Cesium Ion、Mapbox 或国内地图服务可能存在访问、费用或合规问题。

应对：

1. 地图 Provider 封装成可替换模块。
2. 第一版先使用稳定可访问的影像服务。
3. 城市坐标使用本地数据兜底。

### 13.3 前后端类型不一致

风险：Vue TypeScript 类型和 FastAPI schema 不一致。

应对：

1. FastAPI 生成 OpenAPI。
2. 后续使用 openapi-typescript 生成前端 API 类型。
3. 关键模型保持字段命名统一。

### 13.4 本地媒体迁移对象存储

风险：第一版本地媒体后续迁移到对象存储时路径变化。

应对：

1. 页面只使用 media_assets 返回的 public_url。
2. 数据库中保留 storage_provider 和 object_key。
3. 避免在业务表里硬编码本地路径。

## 14. 最终推荐

最终确认技术栈：

```text
Vue 3 + Vite + TypeScript
Pinia + Vue Router
Tailwind CSS + shadcn-vue
CesiumJS
FastAPI + Pydantic
SQLAlchemy 2.0 + Alembic
PostgreSQL
JWT + Refresh Token
Local uploads first, S3-compatible object storage later
Docker Compose + Nginx
```

这套方案兼顾第一版视觉表达、私有部署、后续数据库接入和产品长期扩展，是当前需求下更适合落地的技术路线。
