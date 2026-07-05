import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { Module } from '../../domain/module/module.entity';
import { IModuleRepository } from '../../domain/module/module.repository.interface';

export interface ModuleDocument extends Document {
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export const ModuleSchema = new Schema<ModuleDocument>(
  {
    course_id: {
      type: String,
      required: true,
      ref: 'Course',
    },
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      maxlength: 2000,
    },
    order_index: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

ModuleSchema.index({ course_id: 1, order_index: 1 });
ModuleSchema.index({ course_id: 1, title: 1 });

@Injectable()
export class ModuleRepository implements IModuleRepository {
  constructor(@InjectModel('Module') private moduleModel: Model<ModuleDocument>) {}

  async save(module: Module): Promise<Module> {
    const newModule = new this.moduleModel({
      course_id: module.courseId,
      title: module.title,
      description: module.description,
      order_index: module.orderIndex,
    });
    const saved = await newModule.save();
    module.id = saved._id.toString();
    return module;
  }

  async findById(id: string): Promise<Module | null> {
    const found = await this.moduleModel.findById(id).exec();
    if (!found) return null;
    const module = new Module(
      found.course_id,
      found.title,
      found.order_index,
      found.description || undefined,
    );
    module.id = found._id.toString();
    return module;
  }

  async findByCourse(courseId: string): Promise<Module[]> {
    const found = await this.moduleModel
      .find({ course_id: courseId })
      .sort({ order_index: 1 })
      .exec();
    return found.map((f) => {
      const module = new Module(
        f.course_id,
        f.title,
        f.order_index,
        f.description || undefined,
      );
      module.id = f._id.toString();
      return module;
    });
  }

  async findAll(): Promise<Module[]> {
    const found = await this.moduleModel.find().sort({ order_index: 1 }).exec();
    return found.map((f) => {
      const module = new Module(
        f.course_id,
        f.title,
        f.order_index,
        f.description || undefined,
      );
      module.id = f._id.toString();
      return module;
    });
  }

  async update(id: string, data: Partial<Module>): Promise<Module | null> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;

    const updated = await this.moduleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;
    const module = new Module(
      updated.course_id,
      updated.title,
      updated.order_index,
      updated.description || undefined,
    );
    module.id = updated._id.toString();
    return module;
  }

  async delete(id: string): Promise<void> {
    await this.moduleModel.findByIdAndDelete(id).exec();
  }

  async reorderModules(courseId: string, moduleIds: string[]): Promise<void> {
    const updates = moduleIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, course_id: courseId },
        update: { $set: { order_index: index } },
      },
    }));
    await this.moduleModel.bulkWrite(updates);
  }
}
