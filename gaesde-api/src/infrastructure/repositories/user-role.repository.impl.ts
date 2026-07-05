import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { UserRole } from '../../domain/user-role/user-role.entity';
import { IUserRoleRepository } from '../../domain/user-role/user-role.repository.interface';

export interface UserRoleDocument extends Document {
  user_id: string;
  role_id: string;
  created_at: Date;
}

export const UserRoleSchema = new Schema<UserRoleDocument>(
  {
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    role_id: {
      type: String,
      required: true,
      ref: 'Role',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  },
);

// Índice composto único (user_id, role_id)
UserRoleSchema.index({ user_id: 1, role_id: 1 }, { unique: true });
UserRoleSchema.index({ user_id: 1 });
UserRoleSchema.index({ role_id: 1 });

@Injectable()
export class UserRoleRepository implements IUserRoleRepository {
  constructor(@InjectModel('UserRole') private userRoleModel: Model<UserRoleDocument>) {}

  async save(userRole: UserRole): Promise<UserRole> {
    const newUserRole = new this.userRoleModel({
      user_id: userRole.userId,
      role_id: userRole.roleId,
    });
    const saved = await newUserRole.save();
    userRole.id = saved._id.toString();
    return userRole;
  }

  async findById(id: string): Promise<UserRole | null> {
    const found = await this.userRoleModel.findById(id).exec();
    if (!found) return null;
    const userRole = new UserRole(found.user_id, found.role_id);
    userRole.id = found._id.toString();
    return userRole;
  }

  async findByUser(userId: string): Promise<UserRole[]> {
    const found = await this.userRoleModel.find({ user_id: userId }).exec();
    return found.map((f) => {
      const userRole = new UserRole(f.user_id, f.role_id);
      userRole.id = f._id.toString();
      return userRole;
    });
  }

  async findByRole(roleId: string): Promise<UserRole[]> {
    const found = await this.userRoleModel.find({ role_id: roleId }).exec();
    return found.map((f) => {
      const userRole = new UserRole(f.user_id, f.role_id);
      userRole.id = f._id.toString();
      return userRole;
    });
  }

  async findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null> {
    const found = await this.userRoleModel.findOne({ user_id: userId, role_id: roleId }).exec();
    if (!found) return null;
    const userRole = new UserRole(found.user_id, found.role_id);
    userRole.id = found._id.toString();
    return userRole;
  }

  async findAll(): Promise<UserRole[]> {
    const found = await this.userRoleModel.find().exec();
    return found.map((f) => {
      const userRole = new UserRole(f.user_id, f.role_id);
      userRole.id = f._id.toString();
      return userRole;
    });
  }

  async delete(id: string): Promise<void> {
    await this.userRoleModel.findByIdAndDelete(id).exec();
  }

  async deleteByUser(userId: string): Promise<void> {
    await this.userRoleModel.deleteMany({ user_id: userId }).exec();
  }

  async deleteByRole(roleId: string): Promise<void> {
    await this.userRoleModel.deleteMany({ role_id: roleId }).exec();
  }
}
