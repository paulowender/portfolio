module.exports = {
  apps: [
    {
      name: 'wender-tech-portfolio',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max', // Usa o número máximo de CPUs disponíveis
      exec_mode: 'cluster', // Modo cluster para balanceamento de carga
      watch: false, // Não reinicia automaticamente quando os arquivos mudam
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        NEXT_PUBLIC_PRODUCTION: 'true',
      },
      // Configurações de log
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      // Configurações de reinicialização
      max_memory_restart: '1G', // Reinicia se a memória exceder 1GB
      restart_delay: 3000, // Espera 3 segundos antes de reiniciar
      // Configurações de monitoramento
      max_restarts: 10, // Número máximo de reinicializações
      min_uptime: '30s', // Tempo mínimo que a aplicação deve estar em execução
    },
  ],
};
