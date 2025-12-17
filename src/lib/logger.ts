// ============================================
// SYSTÈME DE LOGGING PROFESSIONNEL
// ============================================
// Service centralisé pour tous les logs de l'application
// Avec niveaux de log, métadonnées et intégration externe

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: string;
    metadata?: Record<string, any>;
    userId?: string;
    sessionId?: string;
}

class Logger {
    private isDevelopment = import.meta.env.DEV;
    private sessionId: string;

    constructor() {
        this.sessionId = this.generateSessionId();
    }

    private generateSessionId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private formatLog(entry: LogEntry): string {
        const { level, message, timestamp, context } = entry;
        const contextStr = context ? `[${context}]` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${contextStr} ${message}`;
    }

    private async sendToExternalService(entry: LogEntry) {
        // En production, envoyer vers Sentry, LogRocket, etc.
        if (!this.isDevelopment && entry.level === 'error' || entry.level === 'critical') {
            try {
                // Exemple : Sentry
                // Sentry.captureException(new Error(entry.message), {
                //   level: entry.level,
                //   extra: entry.metadata,
                // });

                // Exemple : API personnalisée
                await fetch('/api/logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entry),
                });
            } catch (error) {
                console.error('Failed to send log to external service:', error);
            }
        }
    }

    private log(level: LogLevel, message: string, metadata?: Record<string, any>, context?: string) {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            metadata,
            sessionId: this.sessionId,
        };

        // Ajouter l'userId si disponible
        const userId = this.getUserId();
        if (userId) {
            entry.userId = userId;
        }

        // Log dans la console
        const formattedLog = this.formatLog(entry);

        switch (level) {
            case 'debug':
                if (this.isDevelopment) console.debug(formattedLog, metadata);
                break;
            case 'info':
                console.info(formattedLog, metadata);
                break;
            case 'warn':
                console.warn(formattedLog, metadata);
                break;
            case 'error':
            case 'critical':
                console.error(formattedLog, metadata);
                break;
        }

        // Envoyer vers service externe si nécessaire
        this.sendToExternalService(entry);

        // Stocker localement pour debug
        if (this.isDevelopment) {
            this.storeLocally(entry);
        }
    }

    private getUserId(): string | undefined {
        // Récupérer l'ID utilisateur depuis le contexte auth
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user.id;
            }
        } catch {
            return undefined;
        }
    }

    private storeLocally(entry: LogEntry) {
        try {
            const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
            logs.push(entry);

            // Garder seulement les 100 derniers logs
            if (logs.length > 100) {
                logs.shift();
            }

            localStorage.setItem('app_logs', JSON.stringify(logs));
        } catch (error) {
            console.error('Failed to store log locally:', error);
        }
    }

    /**
     * Log de debug (développement uniquement)
     */
    debug(message: string, metadata?: Record<string, any>, context?: string) {
        this.log('debug', message, metadata, context);
    }

    /**
     * Log d'information
     */
    info(message: string, metadata?: Record<string, any>, context?: string) {
        this.log('info', message, metadata, context);
    }

    /**
     * Log d'avertissement
     */
    warn(message: string, metadata?: Record<string, any>, context?: string) {
        this.log('warn', message, metadata, context);
    }

    /**
     * Log d'erreur
     */
    error(message: string, error?: Error, metadata?: Record<string, any>, context?: string) {
        const enrichedMetadata = {
            ...metadata,
            errorName: error?.name,
            errorMessage: error?.message,
            errorStack: error?.stack,
        };
        this.log('error', message, enrichedMetadata, context);
    }

    /**
     * Log critique (erreurs graves)
     */
    critical(message: string, error?: Error, metadata?: Record<string, any>, context?: string) {
        const enrichedMetadata = {
            ...metadata,
            errorName: error?.name,
            errorMessage: error?.message,
            errorStack: error?.stack,
        };
        this.log('critical', message, enrichedMetadata, context);
    }

    /**
     * Récupérer les logs locaux (pour debug)
     */
    getLogs(): LogEntry[] {
        try {
            return JSON.parse(localStorage.getItem('app_logs') || '[]');
        } catch {
            return [];
        }
    }

    /**
     * Effacer les logs locaux
     */
    clearLogs() {
        localStorage.removeItem('app_logs');
    }

    /**
     * Exporter les logs en JSON
     */
    exportLogs(): string {
        const logs = this.getLogs();
        return JSON.stringify(logs, null, 2);
    }
}

// Instance singleton
export const logger = new Logger();

// ============================================
// EXEMPLES D'UTILISATION
// ============================================

/*
// Log simple
logger.info('Utilisateur connecté');

// Log avec métadonnées
logger.info('Commande créée', { orderId: '123', amount: 50 });

// Log avec contexte
logger.info('Chauffeur assigné', { driverId: 'abc' }, 'Dispatch');

// Log d'erreur
try {
  await assignOrderToDriver(params);
} catch (error) {
  logger.error('Échec assignation commande', error, { orderId: params.orderId }, 'Dispatch');
}

// Log critique
logger.critical('Base de données inaccessible', error, { timestamp: Date.now() }, 'Database');

// Récupérer les logs
const logs = logger.getLogs();
console.log(logs);

// Exporter les logs
const logsJson = logger.exportLogs();
downloadFile(logsJson, 'logs.json');
*/
