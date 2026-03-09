import { IsFutureDateConstraint } from './is-future-date.validator';
import { ValidationArguments } from 'class-validator';

describe('IsFutureDateConstraint', () => {
  let validator: IsFutureDateConstraint;

  beforeEach(() => {
    validator = new IsFutureDateConstraint();
  });

  it('should return true for a future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateString = futureDate.toISOString();

    const result = validator.validate(dateString, {} as ValidationArguments);

    expect(result).toBe(true);
  });

  it('should return false for a past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const dateString = pastDate.toISOString();

    const result = validator.validate(dateString, {} as ValidationArguments);

    expect(result).toBe(false);
  });

  it('should return false for the current date/time', () => {
    // This test might be flaky due to timing, but it's close enough
    const now = new Date();
    const dateString = now.toISOString();

    const result = validator.validate(dateString, {} as ValidationArguments);

    // Current time should be considered not future
    expect(result).toBe(false);
  });

  it('should return false for an invalid date string', () => {
    const invalidDate = 'not-a-date';

    const result = validator.validate(invalidDate, {} as ValidationArguments);

    expect(result).toBe(false);
  });

  it('should return false for an empty string', () => {
    const result = validator.validate('', {} as ValidationArguments);

    expect(result).toBe(false);
  });

  it('should return false for null or undefined', () => {
    const resultNull = validator.validate(null as any, {} as ValidationArguments);
    const resultUndefined = validator.validate(undefined as any, {} as ValidationArguments);

    expect(resultNull).toBe(false);
    expect(resultUndefined).toBe(false);
  });

  it('should return the correct default message', () => {
    const message = validator.defaultMessage({} as ValidationArguments);

    expect(message).toBe('A data de encerramento deve ser futura');
  });
});
