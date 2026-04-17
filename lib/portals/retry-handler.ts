/**
 * Configuração de retry para operações de integração
 */
export interface RetryConfig {
    maxAttempts: number;
    baseDelay: number; // in milliseconds
    maxDelay: number; // in milliseconds
    backoffMultiplier: number;
    retryableErrors: string[];
    onRetry?: (attempt: number, error: Error, delay: number) => void;
    onFinalFailure?: (error: Error, attempt: number) => void;
}

/**
 * Resultado de uma operação com retry
 */
export interface RetryResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    attempts: number;
    totalTime: number; // in milliseconds
}

/**
 * Tipos de erro que podem ser retratados
 */
export enum RetryableErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    RATE_LIMIT = 'RATE_LIMIT',
    TEMPORARY_UNAVAILABLE = 'TEMPORARY_UNAVAILABLE',
    AUTHENTICATION = 'AUTHENTICATION',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    TIMEOUT = 'TIMEOUT'
}

/**
 * Classe para gerenciar retry de operações
 */
export class RetryHandler {
    private defaultConfig: RetryConfig;

    constructor(config: Partial<RetryConfig> = {}) {
        this.defaultConfig = {
            maxAttempts: 3,
            baseDelay: 1000, // 1 segundo
            maxDelay: 30000, // 30 segundos
            backoffMultiplier: 2,
            retryableErrors: [
                RetryableErrorType.NETWORK_ERROR,
                RetryableErrorType.RATE_LIMIT,
                RetryableErrorType.TEMPORARY_UNAVAILABLE,
                RetryableErrorType.SERVER_ERROR,
                RetryableErrorType.TIMEOUT
            ],
            ...config
        };
    }

    /**
     * Executa uma operação com retry
     */
    async execute<T>(
        operation: () => Promise<T>,
        config?: Partial<RetryConfig>
    ): Promise<RetryResult<T>> {
        const finalConfig = { ...this.defaultConfig, ...config };
        let lastError: Error | undefined;
        let attempts = 0;

        const startTime = Date.now();

        for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
            attempts++;

            try {
                const result = await operation();
                return {
                    success: true,
                    data: result,
                    attempts,
                    totalTime: Date.now() - startTime
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                // Verificar se o erro é retratável
                if (!this.isRetryableError(lastError, finalConfig.retryableErrors)) {
                    break;
                }

                // Se for a última tentativa, não aguardar
                if (attempt === finalConfig.maxAttempts) {
                    break;
                }

                const delay = this.calculateDelay(attempt, finalConfig);

                // Notificar sobre retry
                if (finalConfig.onRetry) {
                    finalConfig.onRetry(attempt, lastError, delay);
                }

                // Aguardar antes da próxima tentativa
                await this.sleep(delay);
            }
        }

        // Operação falhou após todas as tentativas
        if (finalConfig.onFinalFailure && lastError) {
            finalConfig.onFinalFailure(lastError, attempts);
        }

        return {
            success: false,
            error: lastError,
            attempts,
            totalTime: Date.now() - startTime
        };
    }

    /**
     * Verifica se um erro é retratável
     */
    private isRetryableError(error: Error, retryableErrors: string[]): boolean {
        // Verificar pelo tipo de erro
        if (retryableErrors.some(type => error.message.includes(type))) {
            return true;
        }

        // Verificar por códigos de status HTTP
        if (error.message.includes('429')) { // Too Many Requests
            return true;
        }

        if (error.message.includes('5')) { // Server errors (5xx)
            return true;
        }

        // Verificar por mensagens de erro específicas
        const retryableMessages = [
            'network',
            'timeout',
            'connection',
            'unavailable',
            'temporary',
            'rate limit',
            'too many requests'
        ];

        const message = error.message.toLowerCase();
        return retryableMessages.some(msg => message.includes(msg));
    }

    /**
     * Calcula o delay para o próximo retry com backoff exponencial
     */
    private calculateDelay(attempt: number, config: RetryConfig): number {
        const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
        return Math.min(delay, config.maxDelay);
    }

    /**
     * Função utilitária para dormir
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Gerenciador de circuit breaker para evitar chamadas repetidas a serviços falhos
 */
export class CircuitBreaker {
    private failureCount: number = 0;
    private lastFailureTime: number = 0;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    constructor(
        private failureThreshold: number = 5,
        private recoveryTimeout: number = 60000, // 1 minuto
        private halfOpenMaxRequests: number = 3
    ) { }

    /**
     * Executa uma operação protegida pelo circuit breaker
     */
    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
                this.state = 'HALF_OPEN';
                this.failureCount = 0;
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await operation();

            if (this.state === 'HALF_OPEN') {
                this.state = 'CLOSED';
                this.failureCount = 0;
            }

            return result;
        } catch (error) {
            this.failureCount++;
            this.lastFailureTime = Date.now();

            if (this.failureCount >= this.failureThreshold) {
                this.state = 'OPEN';
            }

            throw error;
        }
    }

    /**
     * Obtém o estado atual do circuit breaker
     */
    getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
        return this.state;
    }

    /**
     * Reseta o circuit breaker
     */
    reset(): void {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.lastFailureTime = 0;
    }
}

/**
 * Gerenciador de rate limiting
 */
export class RateLimiter {
    private requests: Array<{ timestamp: number; count: number }> = [];
    private maxRequests: number;
    private windowMs: number;

    constructor(maxRequests: number = 100, windowMs: number = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    /**
     * Verifica se uma requisição pode ser feita
     */
    canMakeRequest(): boolean {
        const now = Date.now();

        // Remover requisições fora da janela de tempo
        this.requests = this.requests.filter(req => now - req.timestamp < this.windowMs);

        // Verificar se o limite foi atingido
        const totalRequests = this.requests.reduce((sum, req) => sum + req.count, 0);
        return totalRequests < this.maxRequests;
    }

    /**
     * Registra uma requisição
     */
    recordRequest(count: number = 1): void {
        const now = Date.now();
        this.requests.push({ timestamp: now, count });
    }

    /**
     * Obtém o tempo até a próxima requisição disponível
     */
    getTimeToNextRequest(): number {
        if (this.canMakeRequest()) {
            return 0;
        }

        const oldestRequest = this.requests[0];
        if (!oldestRequest) {
            return 0;
        }

        return Math.max(0, this.windowMs - (Date.now() - oldestRequest.timestamp));
    }

    /**
     * Obtém o número de requisições restantes na janela atual
     */
    getRemainingRequests(): number {
        const totalRequests = this.requests.reduce((sum, req) => sum + req.count, 0);
        return Math.max(0, this.maxRequests - totalRequests);
    }
}

/**
 * Classe combinada que gerencia retry, circuit breaker e rate limiting
 */
export class RobustErrorHandler {
    private retryHandler: RetryHandler;
    private circuitBreaker: CircuitBreaker;
    private rateLimiter: RateLimiter;

    constructor(
        retryConfig?: Partial<RetryConfig>,
        circuitBreakerConfig?: {
            failureThreshold?: number;
            recoveryTimeout?: number;
            halfOpenMaxRequests?: number;
        },
        rateLimiterConfig?: {
            maxRequests?: number;
            windowMs?: number;
        }
    ) {
        this.retryHandler = new RetryHandler(retryConfig);
        this.circuitBreaker = new CircuitBreaker(
            circuitBreakerConfig?.failureThreshold,
            circuitBreakerConfig?.recoveryTimeout,
            circuitBreakerConfig?.halfOpenMaxRequests
        );
        this.rateLimiter = new RateLimiter(
            rateLimiterConfig?.maxRequests,
            rateLimiterConfig?.windowMs
        );
    }

    /**
     * Executa uma operação com todas as proteções
     */
    async execute<T>(
        operation: () => Promise<T>,
        operationName: string = 'unknown'
    ): Promise<RetryResult<T>> {
        // Verificar rate limiting
        if (!this.rateLimiter.canMakeRequest()) {
            const waitTime = this.rateLimiter.getTimeToNextRequest();
            throw new Error(`Rate limit exceeded. Wait ${waitTime}ms`);
        }

        // Executar com retry e circuit breaker
        return this.retryHandler.execute(async () => {
            return this.circuitBreaker.execute(operation);
        }, {
            onRetry: (attempt, error, delay) => {
                console.warn(`[RobustErrorHandler] ${operationName} failed (attempt ${attempt}/${this.retryHandler['defaultConfig'].maxAttempts}): ${error.message}. Retrying in ${delay}ms`);
            },
            onFinalFailure: (error, attempt) => {
                console.error(`[RobustErrorHandler] ${operationName} failed after ${attempt} attempts: ${error.message}`);
            }
        });
    }

    /**
     * Obtém o estado do circuit breaker
     */
    getCircuitBreakerState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
        return this.circuitBreaker.getState();
    }

    /**
     * Obtém as informações do rate limiter
     */
    getRateLimiterInfo(): {
        canMakeRequest: boolean;
        remainingRequests: number;
        timeToNextRequest: number;
    } {
        return {
            canMakeRequest: this.rateLimiter.canMakeRequest(),
            remainingRequests: this.rateLimiter.getRemainingRequests(),
            timeToNextRequest: this.rateLimiter.getTimeToNextRequest()
        };
    }

    /**
     * Reseta o circuit breaker
     */
    resetCircuitBreaker(): void {
        this.circuitBreaker.reset();
    }
}

/**
 * Instância global do gerenciador de erros robustos
 */
export const robustErrorHandler = new RobustErrorHandler();

/**
 * Função utilitária para executar operações com tratamento robusto de erros
 */
export async function executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName?: string
): Promise<RetryResult<T>> {
    return robustErrorHandler.execute(operation, operationName);
}

/**
 * Cria um gerenciador de erros personalizado
 */
export function createRobustErrorHandler(
    retryConfig?: Partial<RetryConfig>,
    circuitBreakerConfig?: {
        failureThreshold?: number;
        recoveryTimeout?: number;
        halfOpenMaxRequests?: number;
    },
    rateLimiterConfig?: {
        maxRequests?: number;
        windowMs?: number;
    }
): RobustErrorHandler {
    return new RobustErrorHandler(retryConfig, circuitBreakerConfig, rateLimiterConfig);
}