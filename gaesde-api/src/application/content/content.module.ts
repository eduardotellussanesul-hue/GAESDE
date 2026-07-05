import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { 
  ContentRepository,
  ContentSchema,
  ContentVideoSchema,
  ContentTextSchema,
  ContentPdfSchema,
} from '../../infrastructure/repositories/content.repository.impl';
import { ContentService } from './content.service';
import { ContentController } from '../../presentation/controllers/contents/content.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Content', schema: ContentSchema },
      { name: 'ContentVideo', schema: ContentVideoSchema },
      { name: 'ContentText', schema: ContentTextSchema },
      { name: 'ContentPdf', schema: ContentPdfSchema },
    ]),
  ],
  providers: [
    ContentService,
    { provide: 'IContentRepository', useClass: ContentRepository },
  ],
  controllers: [ContentController],
  exports: [ContentService, 'IContentRepository'],
})
export class ContentModule {}
