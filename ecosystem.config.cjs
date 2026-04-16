module.exports = {
  apps: [
    {
      name: 'pipeline',
      script: 'dist/index.js',
      cwd: '/root/emailhacker-viral/pipeline',
      env: { NODE_ENV: 'production', PORT: 3200 },
      max_memory_restart: '1500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/root/emailhacker-viral/logs/pipeline-error.log',
      out_file: '/root/emailhacker-viral/logs/pipeline-out.log',
    },
    {
      name: 'renderer',
      script: 'dist/index.js',
      cwd: '/root/emailhacker-viral/renderer',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '2G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/root/emailhacker-viral/logs/renderer-error.log',
      out_file: '/root/emailhacker-viral/logs/renderer-out.log',
    },
  ],
}
