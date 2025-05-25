import { Module, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger } from '@nestjs/common';

@Module({})
export class RouteLoggerModule implements OnModuleInit {
    private readonly logger = new Logger('RouteLogger');

    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    onModuleInit() {
        const httpAdapter = this.httpAdapterHost.httpAdapter;
        const server = httpAdapter.getHttpServer();
        const router = server._router || server.router;

        if (router && router.stack) {
            const routes = this.extractRoutes(router);
            this.logRoutes(routes);
        } else {
            this.logger.warn('No router found to log routes');
        }
    }

    private extractRoutes(router: any) {
        return router.stack
            .map((layer: any) => {
                if (layer.route) {
                    return {
                        path: layer.route.path,
                        method: layer.route.stack[0].method.toUpperCase()
                    };
                }
                if (layer.name === 'router' && layer.handle.stack) {
                    return layer.handle.stack.map((sublayer: any) => {
                        if (sublayer.route) {
                            return {
                                path: (layer.regexp.source.replace('\\/', '') + sublayer.route.path)
                                    .replace(/^\/\^?/, '')
                                    .replace(/\$?\//g, '')
                                    .replace(/\\\//g, '/'),
                                method: sublayer.route.stack[0].method.toUpperCase()
                            };
                        }
                        return undefined;
                    });
                }
                return undefined;
            })
            .flat()
            .filter((item: any) => item !== undefined && item.path && item.path !== 'undefined');
    }

    private logRoutes(routes: Array<{ path: string; method: string }>) {
        this.logger.log('══════════════════════════════════════');
        this.logger.log('         ENDPOINTS REGISTRADOS        ');
        this.logger.log('══════════════════════════════════════');
        
        routes.forEach(route => {
            this.logger.log(`${route.method} ${route.path}`);
        });

        this.logger.log('══════════════════════════════════════');
        this.logger.log(`Total: ${routes.length} endpoints`);
        this.logger.log('══════════════════════════════════════');
    }
}