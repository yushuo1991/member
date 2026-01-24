const fs = require('fs')
const path = require('path')

// PM2 doesn't automatically load `.env` when running the standalone server with `node`.
// Parse `.env` and pass values into the app's environment so auth + DB config works.
function parseDotEnv(dotEnvPath) {
  try {
    const raw = fs.readFileSync(dotEnvPath, 'utf8')
    const out = {}
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx <= 0) continue
      const key = trimmed.slice(0, idx).trim()
      let val = trimmed.slice(idx + 1).trim()
      // Remove optional surrounding quotes
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      out[key] = val
    }
    return out
  } catch {
    return {}
  }
}

const dotEnv = parseDotEnv(path.join(__dirname, '.env'))
const baseEnv = { ...process.env, ...dotEnv }

module.exports = {
  apps: [
    {
      name: 'member-system',
      script: '.next/standalone/server.js',
      interpreter: 'node',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',

      env: {
        ...baseEnv,
        NODE_ENV: 'production',
        PORT: 3000,
      },

      env_development: {
        ...baseEnv,
        NODE_ENV: 'development',
        PORT: 3000,
      },

      env_production: {
        ...baseEnv,
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
      wait_ready: false,
      listen_timeout: 3000,
    },
  ],
}

