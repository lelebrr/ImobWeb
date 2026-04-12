declare module 'swagger-ui-react' {
    import { ComponentType } from 'react';

    interface SwaggerUIProps {
        url?: string;
        spec?: object;
        layout?: string;
        docExpansion?: 'list' | 'full' | 'none';
        defaultModelsExpandDepth?: number;
        defaultModelExpandDepth?: number;
        deepLinking?: boolean;
        displayRequestDuration?: boolean;
        filter?: boolean | string | ((operationId: string, operation: any) => boolean);
        filterOperationId?: boolean;
        plugins?: any[];
        requestInterceptor?: (request: any) => any;
        responseInterceptor?: (response: any) => any;
        showExtensions?: boolean;
        showCommonExtensions?: boolean;
        onComplete?: (system: any) => void;
        syntaxHighlight?: boolean | { theme: string };
        tryItOutEnabled?: boolean;
        supportedSubmitMethods?: string[];
        validatorUrl?: string | null;
        withCredentials?: boolean;
        persistAuthorization?: boolean;
    }

    const SwaggerUI: ComponentType<SwaggerUIProps>;
    export default SwaggerUI;
}
