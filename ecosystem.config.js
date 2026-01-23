module.exports = {
  apps: [
    {
      name: 'member-system',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',

      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // 日志配置
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // 日志轮转
      max_size: '10M',
      retain: 7,
      compress: true,

      // 自动重启配置
      autorestart: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // 优雅关闭
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,
    },
  ],
};
