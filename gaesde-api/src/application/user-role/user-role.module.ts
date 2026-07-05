import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRoleRepository, UserRoleSchema } from '../../infrastructure/repositories/user-role.repository.impl';
import { RoleRepository, RoleSchema } from '../../infrastructure/repositories/role.repository.impl';
import { UserRepository, UserSchema } from '../../infrastructure/repositories/user.repository.impl';
import { UserRoleService } from './user-role.service';
import { UserRoleController } from '../../presentation/controllers/users/user-role.controller';
import { RoleModule } from '../role/role.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserRole', schema: UserRoleSchema },
      { name: 'Role', schema: RoleSchema },
      { name: 'User', schema: UserSchema },
    ]),
    forwardRef(() => RoleModule), // Usar forwardRef para evitar circular
    forwardRef(() => UserModule), // Usar forwardRef para evitar circular
  ],
  providers: [
    UserRoleService,
    { provide: 'IUserRoleRepository', useClass: UserRoleRepository },
    { provide: 'IRoleRepository', useClass: RoleRepository },
    { provide: 'IUserRepository', useClass: UserRepository },
  ],
  controllers: [UserRoleController],
  exports: [UserRoleService, 'IUserRoleRepository'],
})
export class UserRoleModule {}
