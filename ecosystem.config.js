// PM2 ecosystem configuration file
// Usage: pm2 start ecosystem.config.cjs

export default {
  apps: [
    {
      name: "ai-caller-backend",
      script: "./index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
