import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

const toBoolean = ({
  obj,
  key,
}: {
  obj: Record<string, unknown>;
  key: string;
}) => obj[key] === true || obj[key] === 'true';

export enum AiProvider {
  Demo = 'demo',
  Cloudflare = 'cloudflare',
}

const usesCloudflare = (env: EnvironmentVariables) =>
  env.AI_PROVIDER === AiProvider.Cloudflare;

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3333;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN: string = 'http://localhost:5173';

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number = 3306;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_DATABASE: string;

  @Transform(toBoolean)
  @IsBoolean()
  DB_LOGGING: boolean = false;

  @IsString()
  @IsNotEmpty()
  UPLOADS_DIR: string = 'storage/uploads';

  @IsUrl({ require_tld: false, require_protocol: true })
  PUBLIC_UPLOADS_URL: string = 'http://localhost:3333/uploads';

  @IsEnum(AiProvider)
  AI_PROVIDER: AiProvider = AiProvider.Demo;

  @ValidateIf(usesCloudflare)
  @IsString()
  @IsNotEmpty()
  CLOUDFLARE_ACCOUNT_ID?: string;

  @ValidateIf(usesCloudflare)
  @IsString()
  @IsNotEmpty()
  CLOUDFLARE_API_TOKEN?: string;

  @IsString()
  @IsNotEmpty()
  CLOUDFLARE_TEXT_MODEL: string = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

  @IsString()
  @IsNotEmpty()
  CLOUDFLARE_IMAGE_MODEL: string = '@cf/black-forest-labs/flux-1-schnell';
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(env);

  if (errors.length > 0) {
    const details = errors
      .flatMap((error) => Object.values(error.constraints ?? {}))
      .map((message) => `  - ${message}`)
      .join('\n');

    throw new Error(`Invalid environment variables:\n${details}`);
  }

  return env;
}
