import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Health check',
    description: 'Verifica se a API está funcionando corretamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'API saudável',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-07-05T18:14:53.821Z',
        service: 'gaesde-api',
        environment: 'development',
        version: '1.0.0',
      },
    },
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'gaesde-api',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }
}
