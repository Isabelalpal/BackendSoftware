import { Test, TestingModule } from '@nestjs/testing';
import { EntitysService } from './entitys.service';

describe('EntitysService', () => {
  let service: EntitysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntitysService],
    }).compile();

    service = module.get<EntitysService>(EntitysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
