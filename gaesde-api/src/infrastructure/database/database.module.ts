import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { SeedService } from './seed.service';
import { UserModule } from '../../application/user/user.module';
import { RoleModule } from '../../application/role/role.module';
import { UserRoleModule } from '../../application/user-role/user-role.module';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    RoleModule,
    UserRoleModule,
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
