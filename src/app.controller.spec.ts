import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('GET /', () => {
    it('should return Sprint 1 message', () => {
      expect(appController.getRoot()).toBe('Probando herramientas del Sprint 1');
    });
  });

  describe('GET /econofarma', () => {
    it('should return Econofarma welcome message', () => {
      expect(appController.getEconofarma()).toBe('Bienvenido al sistema ERP de Farmacia Econofarma');
    });
  });
});
