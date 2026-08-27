# 使用宝塔面板部署项目

本文用于在宝塔面板（BT Panel）中部署本项目。项目是 **Nuxt 4 SSR + MySQL**，需要启动 Nuxt Node.js 服务，再由 Nginx 反向代理。

示例值：域名 `example.com`，项目目录 `/www/wwwroot/ceshi`，Nuxt 端口 `3000`，数据库 `zangbao`。所有示例域名、路径、密码都应替换为实际值。

## 一、安装宝塔面板

1. 使用服务器厂商控制台安装受支持的 Linux 系统，并按宝塔官网对应系统的命令安装面板。
2. 记录面板地址、账号和密码；首次登录后修改默认端口和管理员密码。
3. 在云安全组及宝塔“安全”中放行 `22`、`80`、`443`，不要对公网开放 MySQL `3306`。

## 二、安装运行环境

在宝塔“软件商店”安装 `Nginx`（稳定版）、`MySQL` 8.0+、`Node.js` 版本管理器（20/22 LTS）和（可选）`PM2 管理器`。在“终端”确认 pnpm：

```bash
node -v
corepack enable
corepack prepare pnpm@11.15.1 --activate
pnpm -v
```

## 三、创建 MySQL 数据库

在“数据库 → 添加数据库”中创建数据库 `zangbao`、用户 `zangbao` 和随机强密码`dCcpbcDrnLsFPPPE`，访问权限选择“本地服务器”，字符集选择 `utf8mb4`。记录密码备用。

项目上传后初始化表结构：

```bash
cd /www/wwwroot/ceshi
node scripts/init-db.mjs
node scripts/migrate-cbg-session.mjs
```

注意：这些脚本当前把 MySQL root 连接信息写在脚本文件中。执行前检查 `scripts/init-db.mjs`、`scripts/migrate-cbg-session.mjs` 的连接参数并改成服务器实际值，不要使用示例密码。升级旧版本且需要调整 `records` 唯一索引时，再执行 `node scripts/migrate-link-unique.mjs`。迁移前请先在宝塔数据库页面备份。

## 四、上传或拉取项目

Git 拉取：

```bash
mkdir -p /www/wwwroot
cd /www/wwwroot
git clone <仓库地址> ceshi
cd /www/wwwroot/ceshi
pnpm install --frozen-lockfile
```

也可在宝塔“文件”中上传压缩包并解压到 `/www/wwwroot/ceshi`，再执行 `pnpm install --frozen-lockfile`。不要上传本地 `node_modules`。

## 五、配置环境变量

在 `/www/wwwroot/ceshi/.env` 中填写：

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=3000
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=zangbao
MYSQL_PASSWORD=这里填写宝塔数据库密码
MYSQL_DATABASE=zangbao
```

```bash
chmod 600 /www/wwwroot/ceshi/.env
```

`.env` 不要提交到 Git，也不要放在 Nginx 可直接下载的公开目录中。

## 六、构建项目

```bash
cd /www/wwwroot/ceshi
pnpm build
```

成功后应生成 `.output/server/index.mjs`。内存不足时可在宝塔增加 Swap 后重新构建。

可先直接验证生产服务：

```bash
pnpm start
```

验证完成后按 `Ctrl+C` 停止，再交给 PM2 守护进程。

## 七、使用 PM2 启动 Nuxt

### 方案 A：宝塔 PM2 管理器

在“软件商店 → PM2 管理器 → 添加项目”中填写：项目名 `ceshi`，项目路径 `/www/wwwroot/ceshi`，启动文件 `.output/server/index.mjs`，Node.js 选择 20/22 LTS，端口 `3000`。填写 `.env` 中的环境变量后保存并启动。

### 方案 B：终端命令

```bash
cd /www/wwwroot/ceshi
pnpm add -g pm2
pm2 start .output/server/index.mjs --name ceshi
pm2 save
pm2 startup
```

执行 `pm2 startup` 后，复制并执行它输出的 `sudo` 命令，才能实现开机自启。检查服务：

```bash
pm2 status
pm2 logs ceshi --lines 100
curl http://127.0.0.1:3000
```

## 八、添加网站和反向代理

1. “网站 → 添加站点”，域名填写 `example.com`（可同时填 `www.example.com`），PHP 版本选择“纯静态”。
2. 进入网站“反向代理”，新增代理：代理名 `ceshi-node`，目标 URL `http://127.0.0.1:3000`，发送域名 `$host`。
3. 保存并访问域名，确认页面正常。

也可以在“网站 → 配置文件”的 `server` 块中加入：

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

保存前点击 Nginx 配置测试，确认无错误后再重载 Nginx。

## 九、配置 HTTPS

确认 DNS 已解析且 HTTP 访问正常后，在网站“SSL”页面选择“Let's Encrypt”，勾选实际域名并申请证书，然后开启“强制 HTTPS”。确认宝塔证书续期任务已启用。

## 十、后续更新

```bash
cd /www/wwwroot/ceshi
git pull --ff-only
pnpm install --frozen-lockfile
pnpm build
pm2 reload ceshi --update-env
```

通过宝塔 PM2 管理器启动的项目，则在管理器中点击“重启”。涉及数据库结构变更时，先备份再执行迁移脚本。

## 十一、常见问题

| 问题 | 处理方式 |
| --- | --- |
| 访问出现 502 | 检查 `pm2 status`，确认 `127.0.0.1:3000` 有服务，并核对反向代理端口 |
| 页面能开但数据报错 | 核对 `.env` 的 `MYSQL_*` 变量、数据库权限和 MySQL 状态 |
| `pnpm: command not found` | 重新执行 Corepack 命令，或在宝塔 Node.js 版本管理器中切换正确版本 |
| 启动失败 | 查看 `pm2 logs ceshi`，确认 `.output/server/index.mjs` 存在且 Node.js 版本满足要求 |
| 静态资源 404 | 重新执行 `pnpm build`，不要只上传 `app` 源码后直接启动 |

## 十二、安全与备份

- 修改宝塔面板默认端口和密码，开启面板登录安全设置。
- MySQL 仅允许本机访问，不开放公网 `3306`。
- 定期在宝塔“数据库”页面备份 `zangbao`，并验证备份可恢复。
- `.env`、Cookie、日志和数据库备份不得提交到 Git 或放入网站公开目录。
- 生产环境必须替换项目脚本中的示例 root 密码，并使用强密码。
