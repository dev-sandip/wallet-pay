import 'dotenv/config';
export type Environment = {
  NODE_ENV: 'development' | 'production';
  DATABASE_URL: string;
  PORT: number;
  SWAGGER_ENABLED: boolean;
  BETTER_AUTH_URL: string;
};

export const getEnv = <K extends keyof Environment>(
  key: K,
  fallback?: Environment[K],
): Environment[K] => {
  const value = process.env[key] as Environment[K] | undefined;

  if (value === undefined) {
    // handle fallback falsy cases that should still be used as value
    if (fallback === false || fallback === '' || fallback === 0) {
      return fallback;
    }
    if (fallback) {
      return fallback;
    }
    throw new Error(`Missing environment variable: ${key}.`);
  }

  return value;
};
