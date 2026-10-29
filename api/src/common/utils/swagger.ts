import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { auth } from '../../auth/auth.js';

/**
 * Configures API documentation and mounts the Scalar reference UI.
 *
 * @param app - The NestJS application to configure.
 */
export async function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Wallet Pay API')
    .setDescription('The API documentation for the Wallet Pay application.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const authOpenAPISchema = await auth.api.generateOpenAPISchema();

  const authBasePath = '/api/auth';
  const prefixedAuthPaths: Record<string, any> = {};

  for (const [routePath, pathItem] of Object.entries(
    authOpenAPISchema.paths || {},
  )) {
    const fullPath = routePath.startsWith(authBasePath)
      ? routePath
      : `${authBasePath}${routePath}`;
    prefixedAuthPaths[fullPath] = pathItem;
  }

  document.paths = {
    ...document.paths,
    ...prefixedAuthPaths,
  };

  if (authOpenAPISchema.components) {
    document.components = document.components || {};
    document.components.schemas = {
      ...document.components.schemas,
      ...authOpenAPISchema.components.schemas,
    };
  }
  app.getHttpAdapter().get('/docs/openapi.json', (_req, res) => {
    res.json(document);
  });
  app.use(
    '/docs',
    apiReference({
      theme: 'kepler',
      spec: {
        content: document,
      },
    }),
  );
}
