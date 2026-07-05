import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleService } from '../../../application/user-role/user-role.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userRoleService: UserRoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    for (const roleSlug of requiredRoles) {
      const hasRole = await this.userRoleService.hasRole(user.userId, roleSlug);
      if (hasRole) {
        return true;
      }
    }

    throw new ForbiddenException(`Acesso negado. Role(s) necessárias: ${requiredRoles.join(', ')}`);
  }
}
