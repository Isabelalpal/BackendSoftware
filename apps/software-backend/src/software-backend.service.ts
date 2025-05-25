import { Injectable } from '@nestjs/common';

@Injectable()
export class SoftwareBackendService {
  getHello(): string {
    return 'Hello World!';
  }
}
