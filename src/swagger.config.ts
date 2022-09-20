import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Outside Digital node.js testcase')
  .setDescription(
    'Testcase application for Outside Digital node.js backend dev position',
  )
  .addBearerAuth()
  .build();

export default function setupSwagger(app: INestApplication) {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
}
