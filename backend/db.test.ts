import { describe, it, expect } from 'vitest';
import db from './db';

describe('Database connection & tables', () => {
  it('should connect to database and have users table', (done) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", [], (err, row: any) => {
      expect(err).toBeNull();
      expect(row).toBeDefined();
      expect(row.name).toBe('users');
      done();
    });
  });
});
