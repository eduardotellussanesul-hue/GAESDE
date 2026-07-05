import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../application/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      // 1. Verificar se o usuário existe
      const user = await this.userService.findByEmail(email);
      if (!user) {
        return { 
          success: false, 
          message: 'Usuário não encontrado. Verifique seu email.' 
        };
      }
      
      // 2. Verificar se o usuário tem senha hash
      if (!user.passwordHash) {
        return { 
          success: false, 
          message: 'Erro interno: usuário sem senha configurada. Contate o administrador.' 
        };
      }
      
      // 3. Verificar se a senha está correta
      const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);
      if (!isPasswordValid) {
        return { 
          success: false, 
          message: 'Senha incorreta. Verifique sua senha e tente novamente.' 
        };
      }
      
      // 4. Atualizar last_login
      await this.userService.updateLastLogin(user.id);
      
      // 5. Retornar sucesso
      const { passwordHash, ...result } = user;
      return { 
        success: true, 
        user: result 
      };
      
    } catch (error) {
      console.error('Erro no validateUser:', error);
      return { 
        success: false, 
        message: 'Erro interno ao validar usuário. Tente novamente mais tarde.' 
      };
    }
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    
    const fullUser = await this.userService.findById(user.id);
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        avatarUrl: fullUser.avatarUrl,
        bio: fullUser.bio,
        emailVerifiedAt: fullUser.emailVerifiedAt,
        lastLoginAt: fullUser.lastLoginAt,
        isEmailVerified: fullUser.isEmailVerified,
      },
    };
  }
}
