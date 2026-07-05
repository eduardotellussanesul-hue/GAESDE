import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from '../../application/user/user.service';
import { RoleService } from '../../application/role/role.service';
import { UserRoleService } from '../../application/user-role/user-role.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private userRoleService: UserRoleService,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedAdminUser();
  }

  private async seedRoles() {
    const roles = [
      { name: 'Administrador', slug: 'admin', description: 'Administrador do sistema com acesso total' },
      { name: 'Instrutor', slug: 'instructor', description: 'Instrutor com permissão para gerenciar cursos' },
      { name: 'Aluno', slug: 'student', description: 'Aluno com acesso aos cursos' },
    ];

    for (const roleData of roles) {
      try {
        const existing = await this.roleService.findBySlug(roleData.slug);
        if (!existing) {
          console.log(`🌱 Criando role: ${roleData.name}`);
          await this.roleService.create(roleData);
        } else {
          console.log(`ℹ️  Role ${roleData.name} já existe`);
        }
      } catch (error) {
        console.log(`⚠️  Erro ao criar role ${roleData.name}:`, error.message);
      }
    }
  }

  private async seedAdminUser() {
    try {
      const adminEmail = 'admin@gaesde.com';
      const existingAdmin = await this.userService.findByEmail(adminEmail);
      
      let adminUser;
      if (!existingAdmin) {
        console.log('🌱 Criando usuário administrador...');
        adminUser = await this.userService.create({
          email: adminEmail,
          password: 'Admin@123456',
          name: 'Administrador Master',
          avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Master&background=6C63FF&color=fff&size=128',
          bio: 'Administrador do sistema GAESDE',
        });
        console.log('✅ Usuário administrador criado com sucesso!');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Senha: Admin@123456`);
        console.log('⚠️  ALTERE A SENHA NO PRIMEIRO LOGIN!');
      } else {
        console.log('ℹ️  Usuário administrador já existe.');
        adminUser = existingAdmin;
      }

      // Atribuir role de admin
      if (adminUser && adminUser.id) {
        try {
          const adminRole = await this.roleService.findBySlug('admin');
          if (adminRole && adminRole.id) {
            await this.userRoleService.assignRole(adminUser.id, adminRole.id);
            console.log('✅ Role admin atribuída ao administrador');
          }
        } catch (error) {
          console.log('ℹ️  Role admin já atribuída ou erro:', error.message);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao criar usuário administrador:', error.message);
    }
  }
}
