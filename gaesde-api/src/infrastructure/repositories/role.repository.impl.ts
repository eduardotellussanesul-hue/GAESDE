import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { Role } from '../../domain/role/role.entity';
import { IRoleRepository } from '../../domain/role/role.repository.interface';

export interface RoleDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  created_at: Date;
}

export const RoleSchema = new Schema<RoleDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: false,
      maxlength: 500,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  },
);

RoleSchema.index({ slug: 1 }, { unique: true });
RoleSchema.index({ name: 1 }, { unique: true });

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(@InjectModel('Role') private roleModel: Model<RoleDocument>) {}

  async save(role: Role): Promise<Role> {
    const newRole = new this.roleModel({
      name: role.name,
      slug: role.slug,
      description: role.description,
    });
    const saved = await newRole.save();
    role.id = saved._id.toString();
    return role;
  }

  async findById(id: string): Promise<Role | null> {
    const found = await this.roleModel.findById(id).exec();
    if (!found) return null;
    return new Role(found.name, found.slug, found.description || undefined);
  }

  async findBySlug(slug: string): Promise<Role | null> {
    const found = await this.roleModel.findOne({ slug }).exec();
    if (!found) return null;
    const role = new Role(found.name, found.slug, found.description || undefined);
    role.id = found._id.toString();
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    const found = await this.roleModel.findOne({ name }).exec();
    if (!found) return null;
    const role = new Role(found.name, found.slug, found.description || undefined);
    role.id = found._id.toString();
    return role;
  }

  async findAll(): Promise<Role[]> {
    const found = await this.roleModel.find().exec();
    return found.map((f) => {
      const role = new Role(f.name, f.slug, f.description || undefined);
      role.id = f._id.toString();
      return role;
    });
  }

  async update(id: string, data: Partial<Role>): Promise<Role | null> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;

    const updated = await this.roleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;
    const role = new Role(updated.name, updated.slug, updated.description || undefined);
    role.id = updated._id.toString();
    return role;
  }

  async delete(id: string): Promise<void> {
    await this.roleModel.findByIdAndDelete(id).exec();
  }
}
