import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { UserModule } from '../../application/user/user.module';
import { UserRoleModule } from '../../application/user-role/user-role.module';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret') || 'default-secret',
        signOptions: { 
          expiresIn: config.get<string>('jwt.expiresIn') || '7d' 
        } as any, // <-- SOLUÇÃO: forçar o tipo
      }),
      inject: [ConfigService],
    }),
    UserModule,
    UserRoleModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    PassportModule,
    RolesGuard,
  ],
})
export class AuthModule {}
