import { NodeEnv, validateEnv } from './env.validation.js';

const requiredVars = {
  DB_HOST: 'localhost',
  DB_USERNAME: 'hero_forge',
  DB_PASSWORD: 'secret',
  DB_DATABASE: 'hero_forge',
};

describe('validateEnv', () => {
  it('applies defaults for optional variables', () => {
    const env = validateEnv(requiredVars);

    expect(env).toMatchObject({
      NODE_ENV: NodeEnv.Development,
      PORT: 3333,
      DB_PORT: 3306,
      DB_LOGGING: false,
      CORS_ORIGIN: 'http://localhost:5173',
    });
  });

  it('converts numeric and boolean strings', () => {
    const env = validateEnv({
      ...requiredVars,
      PORT: '4000',
      DB_PORT: '3307',
      DB_LOGGING: 'true',
    });

    expect(env.PORT).toBe(4000);
    expect(env.DB_PORT).toBe(3307);
    expect(env.DB_LOGGING).toBe(true);
  });

  it('treats any value other than "true" as false', () => {
    const env = validateEnv({ ...requiredVars, DB_LOGGING: 'false' });

    expect(env.DB_LOGGING).toBe(false);
  });

  it('throws when a required variable is missing', () => {
    const { DB_HOST: _omitted, ...withoutHost } = requiredVars;

    expect(() => validateEnv(withoutHost)).toThrow(/DB_HOST/);
  });

  it('throws when a value is out of range', () => {
    expect(() => validateEnv({ ...requiredVars, PORT: '70000' })).toThrow(
      /PORT/,
    );
  });

  it('throws when NODE_ENV is not supported', () => {
    expect(() => validateEnv({ ...requiredVars, NODE_ENV: 'staging' })).toThrow(
      /NODE_ENV/,
    );
  });
});
