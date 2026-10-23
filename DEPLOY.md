# 生产环境部署指南

本文适用于本项目（Nuxt 4 SSR + MySQL）部署到 Ubuntu/Debian Linux 服务器的场景。示例使用 `pnpm`、`PM2` 和 `Nginx`，域名以 `example.com` 代替。

## 1. 部署前准备

服务器建议满足：

- Ubuntu 22.04/24.04 或 Debian 12
- Node.js 20 LTS 及以上（建议使用 Node.js 22 LTS）
- MySQL 8.0 及以上
- 至少开放 `22`、`80` 端口；配置 HTTPS 后再开放 `443`
- 已将域名 `example.com` 的 DNS A/AAAA 记录指向服务器

以下命令默认使用具有 `sudo` 权限的账号执行。

## 2. 安装系统依赖

```bash
sudo apt update
sudo apt install -y git curl nginx mysql-server

# 安装 Node.js（NodeSource 示例）
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 启用 pnpm（项目 package.json 要求 pnpm 11.15.1）
sudo corepack enable
corepack prepare pnpm@11.15.1 --activate

node -v
pnpm -v
```

## 3. 创建 MySQL 数据库

先执行安全初始化（按提示设置 root 密码）：

```bash
sudo mysql_secure_installation
```

使用 root 登录并创建业务库和专用账号。请替换示例密码：

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS zangbao
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'zangbao'@'localhost' IDENTIFIED BY '请替换为强密码';
GRANT ALL PRIVILEGES ON zangbao.* TO 'zangbao'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 4. 获取代码并安装依赖

```bash
sudo mkdir -p /var/www
sudo chown -R "$USER":"$USER" /var/www
cd /var/www
git clone <仓库地址> ceshi
cd /var/www/ceshi
pnpm install --frozen-lockfile
```

如果代码已通过压缩包上传，请将项目解压到 `/var/www/ceshi`，确保该目录中存在 `package.json` 和 `pnpm-lock.yaml`。

## 5. 配置生产环境变量

项目通过以下变量连接 MySQL；未配置时会使用代码中的默认值，因此生产环境必须显式配置：

```bash
sudo mkdir -p /etc/ceshi
sudo nano /etc/ceshi/ceshi.env
```

文件内容示例（不要提交到 Git）：

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=3000
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=zangbao
MYSQL_PASSWORD=请替换为数据库强密码
MYSQL_DATABASE=zangbao
```

```bash
sudo chmod 600 /etc/ceshi/ceshi.env
```

## 6. 初始化表结构和执行迁移

项目提供了初始化脚本。脚本中的 MySQL root 连接参数目前写在 `scripts/init-db.mjs`、`scripts/migrate-link-unique.mjs` 和 `scripts/migrate-cbg-session.mjs` 中，执行前请检查并改成服务器实际的 root 连接信息，或使用等效 SQL 手动执行。不要在生产环境继续使用示例密码。

首次部署可执行：

```bash
cd /var/www/ceshi
node scripts/init-db.mjs
node scripts/migrate-cbg-session.mjs
```

只有从旧版本升级且需要变更唯一索引时才执行：

```bash
node scripts/migrate-link-unique.mjs
```

该迁移会删除旧的 `uk_link` 全局唯一索引，并确保使用 `uk_user_link (user_id, link)`；迁移后同一藏宝阁账号可由多个用户分别添加，价格和备注互不影响。

执行前建议先备份数据库：

```bash
mysqldump -u root -p --single-transaction zangbao > /var/backups/zangbao-$(date +%F-%H%M%S).sql
```

## 7. 构建并启动 Nuxt

```bash
cd /var/www/ceshi
pnpm build
```

安装 PM2 并创建启动配置：

```bash
sudo pnpm add -g pm2
sudo nano /var/www/ceshi/ecosystem.config.cjs
```

```js
module.exports = {
  apps: [{
    name: 'ceshi',
    cwd: '/var/www/ceshi',
    script: '.output/server/index.mjs',
    interpreter: 'node',
    env_file: '/etc/ceshi/ceshi.env',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '512M'
  }]
}
```

启动并设置开机自启：

```bash
cd /var/www/ceshi
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd
# 按上一条命令输出的提示，再复制执行对应的 sudo 命令
```

检查应用：

```bash
pm2 status
pm2 logs ceshi --lines 100
curl http://127.0.0.1:3000
```

## 8. 配置 Nginx 反向代理

```bash
sudo nano /etc/nginx/sites-available/ceshi
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

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
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ceshi /etc/nginx/sites-enabled/ceshi
sudo nginx -t
sudo systemctl reload nginx
```

## 9. 配置 HTTPS（推荐）

确认域名已解析且 HTTP 访问正常后：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
sudo systemctl status certbot.timer
```

Certbot 会自动修改 Nginx 配置并配置证书续期。可用以下命令测试续期流程：

```bash
sudo certbot renew --dry-run
```

## 10. 后续发布/更新

```bash
cd /var/www/ceshi
git fetch --all
git checkout <目标分支或版本>
git pull --ff-only
pnpm install --frozen-lockfile
pnpm build
pm2 reload ceshi --update-env
pm2 status
```

如果更新包含数据库迁移，先备份，再执行对应迁移脚本，最后重载应用。发布失败时可查看 `pm2 logs ceshi` 和 `sudo journalctl -u nginx -n 100 --no-pager`。

## 11. 回滚

代码回滚：

```bash
cd /var/www/ceshi
git log --oneline -5
git checkout <上一个可用版本>
pnpm install --frozen-lockfile
pnpm build
pm2 reload ceshi --update-env
```

数据库回滚请使用发布前生成的备份文件，并先确认不会覆盖其他业务数据：

```bash
mysql -u root -p zangbao < /var/backups/数据库备份文件.sql
```

## 12. 常见排查

| 现象 | 排查命令 |
| --- | --- |
| 页面打不开 | `pm2 status`、`pm2 logs ceshi`、`curl http://127.0.0.1:3000` |
| 502 Bad Gateway | `sudo nginx -t`，确认 PM2 正在监听 `127.0.0.1:3000` |
| 数据库连接失败 | 检查 `/etc/ceshi/ceshi.env`、`systemctl status mysql`，并测试 `mysql -u zangbao -p -h 127.0.0.1` |
| 静态资源 404 | 确认已执行 `pnpm build`，并检查 `.output/public` 是否存在 |
| 更新后环境变量未生效 | 执行 `pm2 reload ceshi --update-env`，必要时 `pm2 delete ceshi && pm2 start ecosystem.config.cjs` |

## 13. 生产安全建议

- 不要把 `.env`、`/etc/ceshi/ceshi.env`、数据库备份或 Cookie 提交到 Git。
- MySQL 仅监听本机（或私网），防火墙不要开放 `3306` 到公网。
- 定期备份数据库，并验证备份确实可以恢复。
- 为服务器、数据库和应用日志设置磁盘空间监控与轮转策略。
- 修改初始化脚本中的硬编码 root 密码，优先改为读取环境变量或通过安全的运维方式传入。
