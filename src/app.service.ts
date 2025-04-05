import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRootMessage(): string {
    return 'Probando herramientas del Sprint 1';
  }

  getEconofarmaMessage(): string {
    return 'Bienvenido al sistema ERP de Farmacia Econofarma';
  }
}
