import { Test, TestingModule } from '@nestjs/testing';
import { AppController} from './software-backend.controller';
import { SoftwareBackendService } from './software-backend.service';

describe('SoftwareBackendController', () => {
  let softwareBackendController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [SoftwareBackendService],
    }).compile();

    softwareBackendController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(softwareBackendController.getHello()).toBe('Hello World!');
    });
  });
});
