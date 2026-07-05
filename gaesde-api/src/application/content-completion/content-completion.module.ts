import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { 
  ContentCompletionRepository, 
  ContentCompletionSchema 
} from '../../infrastructure/repositories/content-completion.repository.impl';
import { ContentCompletionService } from './content-completion.service';
import { ContentCompletionController } from '../../presentation/controllers/content-completion.controller';
import { ContentModule } from '../content/content.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ContentCompletion', schema: ContentCompletionSchema }]),
    ContentModule,
    EnrollmentModule,
  ],
  providers: [
    ContentCompletionService,
    { provide: 'IContentCompletionRepository', useClass: ContentCompletionRepository },
  ],
  controllers: [ContentCompletionController],
  exports: [ContentCompletionService, 'IContentCompletionRepository'], // Exportar o repositório
})
export class ContentCompletionModule {}
