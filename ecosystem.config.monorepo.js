/**
 * PM2 Ecosystem Configuration for Monorepo
 *
 * 支持4个Next.js应用并行运行:
 * - member-web (会员系统) - Port 3000
 * - member-bk (板块节奏系统) - Port 3001
 * - member-fuplan (复盘系统) - Port 3002
 * - member-xinli (心理测评系统) - Port 3003
 *
 * 使用方法:
 * pm2 start ecosystem.config.monorepo.js --env production
 * pm2 reload ecosystem.config.monorepo.js
 * pm2 logs
 * pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'member-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/www/wwwroot/member-system',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        APP_NAME: 'member-web'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/www/wwwroot/member-system/logs/error.log',
      out_file: '/www/wwwroot/member-system/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    },

    {
      name: 'member-bk',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/www/wwwroot/bk-system',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        APP_NAME: 'member-bk'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/www/wwwroot/bk-system/logs/error.log',
      out_file: '/www/wwwroot/bk-system/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '800M',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    },

    {
      name: 'member-fuplan',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      cwd: '/www/wwwroot/fuplan-system',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        APP_NAME: 'member-fuplan'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/www/wwwroot/fuplan-system/logs/error.log',
      out_file: '/www/wwwroot/fuplan-system/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '800M',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    },

    {
      name: 'member-xinli',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3003',
      cwd: '/www/wwwroot/xinli-system',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        APP_NAME: 'member-xinli'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      error_file: '/www/wwwroot/xinli-system/logs/error.log',
      out_file: '/www/wwwroot/xinli-system/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '800M',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
