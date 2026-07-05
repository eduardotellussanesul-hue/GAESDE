import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository, UserSchema } from '../../infrastructure/repositories/user.repository.impl';
import { UserService } from './user.service';
import { UserController } from '../../presentation/controllers/users/user.controller';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';
import { UserRoleModule } from '../user-role/user-role.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    CloudinaryModule,
    forwardRef(() => UserRoleModule), // Usar forwardRef para evitar circular
  ],
  providers: [
    UserService,
    { provide: 'IUserRepository', useClass: UserRepository },
  ],
  controllers: [UserController],
  exports: [UserService, 'IUserRepository'],
})
export class UserModule {}
