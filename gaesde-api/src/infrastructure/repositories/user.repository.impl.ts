import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { User } from '../../domain/user/user.entity';
import { IUserRepository } from '../../domain/user/user.repository.interface';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password_hash?: string;
  password?: string; // Compatibilidade com schema antigo
  avatar_url?: string;
  avatar?: string; // Compatibilidade com schema antigo
  bio?: string;
  email_verified_at?: Date;
  last_login_at?: Date;
  created_at: Date;
  createdAt?: Date;
  updated_at: Date;
  updatedAt?: Date;
  deleted_at?: Date;
  deletedAt?: Date;
}

export const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
      trim: true,
      lowercase: true,
    },
    password_hash: {
      type: String,
      required: false, // Não obrigatório para compatibilidade
    },
    password: {
      type: String,
      required: false,
      select: false, // Não retornar por padrão
    },
    avatar_url: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
      maxlength: 500,
    },
    email_verified_at: {
      type: Date,
      required: false,
    },
    last_login_at: {
      type: Date,
      required: false,
    },
    deleted_at: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

// Índices
UserSchema.index({ deleted_at: 1 });

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  private getPasswordHash(document: UserDocument): string {
    return document.password_hash || document.password || '';
  }

  private getAvatarUrl(document: UserDocument): string | undefined {
    return document.avatar_url || document.avatar || undefined;
  }

  async save(user: User): Promise<User> {
    const newUser = new this.userModel({
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      avatar_url: user.avatarUrl,
      bio: user.bio,
      email_verified_at: user.emailVerifiedAt,
      last_login_at: user.lastLoginAt,
    });

    const saved = await newUser.save();
    user.id = saved._id.toString();
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const found = await this.userModel.findById(id).exec();
    if (!found || found.deleted_at) return null;

    const passwordHash = this.getPasswordHash(found);
    const avatarUrl = this.getAvatarUrl(found);

    const user = new User(
      found.name,
      found.email,
      passwordHash,
      avatarUrl,
      found.bio || undefined,
      found.email_verified_at || undefined,
      found.last_login_at || undefined,
    );
    user.id = found._id.toString();
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.userModel.findOne({ email }).exec();
    if (!found) return null;

    const passwordHash = this.getPasswordHash(found);
    const avatarUrl = this.getAvatarUrl(found);

    const user = new User(
      found.name,
      found.email,
      passwordHash,
      avatarUrl,
      found.bio || undefined,
      found.email_verified_at || undefined,
      found.last_login_at || undefined,
    );
    user.id = found._id.toString();

    return user;
  }

  async findAll(): Promise<User[]> {
    const found = await this.userModel.find({ deleted_at: null }).exec();
    return found.map((f) => {
      const passwordHash = this.getPasswordHash(f);
      const avatarUrl = this.getAvatarUrl(f);
      
      const user = new User(
        f.name,
        f.email,
        passwordHash,
        avatarUrl,
        f.bio || undefined,
        f.email_verified_at || undefined,
        f.last_login_at || undefined,
      );
      user.id = f._id.toString();
      return user;
    });
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.passwordHash !== undefined) updateData.password_hash = data.passwordHash;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.emailVerifiedAt !== undefined) updateData.email_verified_at = data.emailVerifiedAt;
    if (data.lastLoginAt !== undefined) updateData.last_login_at = data.lastLoginAt;
    if (data.deletedAt !== undefined) updateData.deleted_at = data.deletedAt;

    const updated = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) return null;

    const passwordHash = this.getPasswordHash(updated);
    const avatarUrl = this.getAvatarUrl(updated);

    const user = new User(
      updated.name,
      updated.email,
      passwordHash,
      avatarUrl,
      updated.bio || undefined,
      updated.email_verified_at || undefined,
      updated.last_login_at || undefined,
    );
    user.id = updated._id.toString();
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { deleted_at: new Date() }).exec();
  }

  async hardDelete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
