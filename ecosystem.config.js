/**
 * PM2 Ecosystem Configuration for TextiSur
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 start ecosystem.config.js --env production
 *   pm2 reload ecosystem.config.js
 *   pm2 stop textisur
 *   pm2 logs textisur
 */

module.exports = {
    apps: [
        {
            // Application Configuration
            name: 'textisur',
            script: 'server.ts',
            interpreter: 'ts-node',
            interpreter_args: '--project tsconfig.server.json',

            // Alternatively, if using built version:
            // script: 'node_modules/next/dist/bin/next',
            // args: 'start',

            // Instance Configuration
            instances: process.env.PM2_INSTANCES || 2,
            exec_mode: 'cluster',

            // Environment Variables
            env: {
                NODE_ENV: 'development',
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            env_staging: {
                NODE_ENV: 'production',
                PORT: 3001,
            },

            // Logging
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_file: './logs/pm2-combined.log',
            time: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,

            // Advanced Features
            watch: false, // Set to true in development if needed
            ignore_watch: [
                'node_modules',
                '.next',
                'logs',
                '.git',
                'public/uploads'
            ],

            // Auto-restart Configuration
            max_memory_restart: '500M',
            min_uptime: '10s',
            max_restarts: 10,
            restart_delay: 4000,

            // Graceful Shutdown
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,

            // Error Handling
            autorestart: true,
            exp_backoff_restart_delay: 100,

            // Monitoring
            source_map_support: true,
            instance_var: 'INSTANCE_ID',

            // Cron Restart (optional - restart every day at 3 AM)
            // cron_restart: '0 3 * * *',
        }
    ],

    /**
     * Deployment Configuration
     * 
     * Usage:
     *   pm2 deploy ecosystem.config.js production setup
     *   pm2 deploy ecosystem.config.js production
     *   pm2 deploy ecosystem.config.js production revert 1
     */
    deploy: {
        production: {
            user: 'ubuntu',
            host: ['your-server-ip'],
            ref: 'origin/main',
            repo: 'git@github.com:yourusername/textisur.git',
            path: '/var/www/textisur',
            'ssh_options': 'StrictHostKeyChecking=no',
            'pre-setup': 'apt-get install git',
            'post-setup': 'npm install && npm run build',
            'pre-deploy-local': 'echo "Deploying to production..."',
            'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',
            env: {
                NODE_ENV: 'production'
            }
        },
        staging: {
            user: 'ubuntu',
            host: ['your-staging-server-ip'],
            ref: 'origin/develop',
            repo: 'git@github.com:yourusername/textisur.git',
            path: '/var/www/textisur-staging',
            'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging && pm2 save',
            env: {
                NODE_ENV: 'production'
            }
        }
    }
};
