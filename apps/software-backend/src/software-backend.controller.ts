import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  [x: string]: any;
  @Get()
  getRoot() {
    return {
      app: 'Sistema de Gestión de Hoteles',
      version: '1.0',
      status: 'Activo',
      endpoints: {
        hoteles: '/hoteles',
        usuarios: '/usuarios'
      },
      timestamp: new Date().toISOString()
    };
  }
}