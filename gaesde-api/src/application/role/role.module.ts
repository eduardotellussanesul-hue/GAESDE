import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleRepository, RoleSchema } from '../../infrastructure/repositories/role.repository.impl';
import { RoleService } from './role.service';
import { RoleController } from '../../presentation/controllers/roles/role.controller';
import { UserRoleModule } from '../user-role/user-role.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Role', schema: RoleSchema }]),
    forwardRef(() => UserRoleModule), // Usar forwardRef para evitar circular
  ],
  providers: [
    RoleService,
    { provide: 'IRoleRepository', useClass: RoleRepository },
  ],
  controllers: [RoleController],
  exports: [RoleService, 'IRoleRepository'],
})
export class RoleModule {}
