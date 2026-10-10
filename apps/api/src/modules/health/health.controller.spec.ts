import { ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  const query = vi.fn();
  const controller = new HealthController({ query } as unknown as DataSource);

  beforeEach(() => {
    query.mockReset();
  });

  it('reports the database as up when it answers', async () => {
    query.mockResolvedValue([{ 1: 1 }]);

    await expect(controller.check()).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('throws 503 when the database does not answer', async () => {
    query.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(controller.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
