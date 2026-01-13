import { registerSchema, loginSchema } from './auth';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123',
    };

    describe('valid data', () => {
      it('should pass with minimal required fields', () => {
        const { error } = registerSchema.validate(validUserData);
        expect(error).toBeUndefined();
      });

      it('should pass with all optional fields', () => {
        const fullData = {
          ...validUserData,
          role: 'USER',
          name: 'John',
          surname: 'Doe',
          nickName: 'johnd',
          age: 25,
        };
        const { error } = registerSchema.validate(fullData);
        expect(error).toBeUndefined();
      });

      it.each(['ADMIN', 'USER'])('should accept role %s', (role) => {
        const { error } = registerSchema.validate({ ...validUserData, role });
        expect(error).toBeUndefined();
      });
    });

    describe('email validation', () => {
      it('should reject missing email', () => {
        const { error } = registerSchema.validate({ password: 'password123' });
        expect(error?.details[0].path).toContain('email');
      });

      it.each(['notanemail', 'missing@tld', '@nodomain.com', ''])(
        'should reject invalid email: %s',
        (email) => {
          const { error } = registerSchema.validate({ ...validUserData, email });
          expect(error?.details[0].path).toContain('email');
        }
      );
    });

    describe('password validation', () => {
      it('should reject missing password', () => {
        const { error } = registerSchema.validate({ email: 'test@example.com' });
        expect(error?.details[0].path).toContain('password');
      });

      it('should reject password shorter than 6 characters', () => {
        const { error } = registerSchema.validate({
          ...validUserData,
          password: '12345',
        });
        expect(error?.details[0].path).toContain('password');
        expect(error?.details[0].type).toBe('string.min');
      });

      it('should accept password with exactly 6 characters', () => {
        const { error } = registerSchema.validate({
          ...validUserData,
          password: '123456',
        });
        expect(error).toBeUndefined();
      });
    });

    describe('optional fields', () => {
      it('should reject invalid role', () => {
        const { error } = registerSchema.validate({
          ...validUserData,
          role: 'SUPERADMIN',
        });
        expect(error?.details[0].path).toContain('role');
      });

      it('should reject negative age', () => {
        const { error } = registerSchema.validate({
          ...validUserData,
          age: -1,
        });
        expect(error?.details[0].path).toContain('age');
      });

      it('should reject non-integer age', () => {
        const { error } = registerSchema.validate({
          ...validUserData,
          age: 25.5,
        });
        expect(error?.details[0].type).toBe('number.integer');
      });
    });
  });

  describe('loginSchema', () => {
    it('should pass with valid credentials', () => {
      const { error } = loginSchema.validate({
        email: 'test@example.com',
        password: 'anypassword',
      });
      expect(error).toBeUndefined();
    });

    it('should require both email and password', () => {
      const emailOnly = loginSchema.validate({ email: 'test@example.com' });
      const passwordOnly = loginSchema.validate({ password: 'password' });

      expect(emailOnly.error?.details[0].path).toContain('password');
      expect(passwordOnly.error?.details[0].path).toContain('email');
    });

    it('should not enforce password minimum length (login vs register)', () => {
      const { error } = loginSchema.validate({
        email: 'test@example.com',
        password: 'x',
      });
      expect(error).toBeUndefined();
    });
  });
});
