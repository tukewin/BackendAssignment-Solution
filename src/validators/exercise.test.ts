import {
  createExerciseSchema,
  updateExerciseSchema,
  exerciseQuerySchema,
} from './exercise';

describe('Exercise Validators', () => {
  describe('createExerciseSchema', () => {
    const validExercise = {
      name: 'Push-ups',
      difficulty: 'MEDIUM',
      programID: 1,
    };

    it('should pass with valid data', () => {
      const { error } = createExerciseSchema.validate(validExercise);
      expect(error).toBeUndefined();
    });

    it('should require all fields', () => {
      const testCases = [
        { data: { difficulty: 'EASY', programID: 1 }, missing: 'name' },
        { data: { name: 'Test', programID: 1 }, missing: 'difficulty' },
        { data: { name: 'Test', difficulty: 'EASY' }, missing: 'programID' },
      ];

      testCases.forEach(({ data, missing }) => {
        const { error } = createExerciseSchema.validate(data);
        expect(error?.details[0].path).toContain(missing);
      });
    });

    it.each(['EASY', 'MEDIUM', 'HARD'])(
      'should accept difficulty %s',
      (difficulty) => {
        const { error } = createExerciseSchema.validate({
          ...validExercise,
          difficulty,
        });
        expect(error).toBeUndefined();
      }
    );

    it('should reject invalid difficulty', () => {
      const { error } = createExerciseSchema.validate({
        ...validExercise,
        difficulty: 'EXTREME',
      });
      expect(error?.details[0].type).toBe('any.only');
    });
  });

  describe('updateExerciseSchema', () => {
    it('should pass with empty object (all fields optional)', () => {
      const { error } = updateExerciseSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('should pass with partial update', () => {
      const { error } = updateExerciseSchema.validate({ name: 'New name' });
      expect(error).toBeUndefined();
    });

    it('should still validate field types', () => {
      const { error } = updateExerciseSchema.validate({ programID: 'not-a-number' });
      expect(error?.details[0].type).toBe('number.base');
    });
  });

  describe('exerciseQuerySchema', () => {
    it('should pass with no params', () => {
      const { error } = exerciseQuerySchema.validate({});
      expect(error).toBeUndefined();
    });

    it('should pass with valid pagination', () => {
      const { error } = exerciseQuerySchema.validate({ page: 1, limit: 10 });
      expect(error).toBeUndefined();
    });

    it('should reject page less than 1', () => {
      const { error } = exerciseQuerySchema.validate({ page: 0 });
      expect(error?.details[0].type).toBe('number.min');
    });

    it('should reject limit greater than 100', () => {
      const { error } = exerciseQuerySchema.validate({ limit: 101 });
      expect(error?.details[0].type).toBe('number.max');
    });

    it('should accept search query', () => {
      const { error } = exerciseQuerySchema.validate({ search: 'push' });
      expect(error).toBeUndefined();
    });
  });
});
