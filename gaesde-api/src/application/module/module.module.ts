import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleRepository, ModuleSchema } from '../../infrastructure/repositories/module.repository.impl';
import { ModuleService } from './module.service';
import { ModuleController } from '../../presentation/controllers/modules/module.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Module', schema: ModuleSchema }]),
  ],
  providers: [
    ModuleService,
    { provide: 'IModuleRepository', useClass: ModuleRepository },
  ],
  controllers: [ModuleController],
  exports: [ModuleService],
})
export class ModuleModule {}
