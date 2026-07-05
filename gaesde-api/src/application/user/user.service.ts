import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/user/user.repository.interface';
import { User } from '../../domain/user/user.entity';
import { 
  UserNotFoundException, 
  UserAlreadyExistsException,
} from '../../domain/user/user.exceptions';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository') private userRepository: IUserRepository,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(data: { 
    email: string; 
    password: string; 
    name: string; 
    avatarUrl?: string;
    bio?: string;
  }): Promise<any> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new UserAlreadyExistsException(data.email);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new User(
      data.name,
      data.email,
      hashedPassword,
      data.avatarUrl,
      data.bio,
    );
    
    const savedUser = await this.userRepository.save(user);
    
    return this.mapToResponse(savedUser);
  }

  async uploadFileToCloudinary(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    return this.cloudinaryService.uploadFile(file, {
      folder: `users/temp`,
      public_id: `avatar-${Date.now()}`,
    });
  }

  async deleteCloudinaryFile(avatarUrl: string): Promise<void> {
    try {
      const publicId = this.extractPublicIdFromUrl(avatarUrl);
      if (publicId) {
        await this.cloudinaryService.deleteFile(publicId);
      }
    } catch (error) {
      console.log('Erro ao deletar avatar:', error.message);
    }
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    if (user.avatarUrl) {
      await this.deleteCloudinaryFile(user.avatarUrl);
    }

    const { url } = await this.cloudinaryService.uploadFile(file, {
      folder: `users/${userId}/avatar`,
      public_id: `avatar-${Date.now()}`,
    });

    const updatedUser = await this.userRepository.update(userId, { 
      avatarUrl: url 
    } as any);
    
    if (!updatedUser) {
      throw new UserNotFoundException(userId);
    }

    return this.mapToResponse(updatedUser);
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0];
      const folderPath = parts.slice(parts.indexOf('upload') + 2, -1).join('/');
      return folderPath ? `${folderPath}/${publicId}` : publicId;
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<any[]> {
    const users = await this.userRepository.findAll();
    return users.map(user => this.mapToResponse(user));
  }

  async findById(id: string): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return this.mapToResponse(user);
  }

  async findByEmail(email: string): Promise<any> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    
    console.log('🔍 findByEmail - User encontrado:', user.email);
    console.log('🔍 findByEmail - PasswordHash:', user.passwordHash ? 'presente' : 'ausente');
    
    // Retornar o objeto completo com todos os campos
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash, // <-- GARANTIR QUE ESTÁ AQUI
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      isDeleted: user.isDeleted,
      isEmailVerified: user.isEmailVerified,
    };
  }

  async update(id: string, data: any): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    if (data.email) user.email = data.email;
    if (data.name) user.name = data.name;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.passwordHash) user.passwordHash = data.passwordHash;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    
    const updated = await this.userRepository.update(id, user);
    if (!updated) {
      throw new UserNotFoundException(id);
    }
    
    return this.mapToResponse(updated);
  }

  async updateLastLogin(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    user.updateLastLogin();
    await this.userRepository.update(id, user);
  }

  async verifyEmail(id: string): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    user.verifyEmail();
    const updated = await this.userRepository.update(id, user);
    return this.mapToResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.softDelete();
    await this.userRepository.update(id, user);
  }

  async hardDelete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    
    if (user.avatarUrl) {
      await this.deleteCloudinaryFile(user.avatarUrl);
    }
    
    await this.userRepository.hardDelete(id);
  }

  async restore(id: string): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    user.restore();
    const updated = await this.userRepository.update(id, user);
    return this.mapToResponse(updated);
  }

  private mapToResponse(user: User): any {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      bio: user.bio || null,
      emailVerifiedAt: user.emailVerifiedAt || null,
      lastLoginAt: user.lastLoginAt || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt || null,
      isDeleted: user.isDeleted,
      isEmailVerified: user.isEmailVerified,
    };
  }
}
