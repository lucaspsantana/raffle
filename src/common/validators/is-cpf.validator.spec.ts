import { IsCpfConstraint } from './is-cpf.validator';

describe('IsCpfConstraint', () => {
  let validator: IsCpfConstraint;

  beforeEach(() => {
    validator = new IsCpfConstraint();
  });

  describe('validate', () => {
    it('should return true for valid CPF', () => {
      expect(validator.validate('12345678909')).toBe(true);
      expect(validator.validate('11144477735')).toBe(true);
    });

    it('should return true for valid CPF with formatting', () => {
      expect(validator.validate('123.456.789-09')).toBe(true);
      expect(validator.validate('111.444.777-35')).toBe(true);
    });

    it('should return false for CPF with invalid length', () => {
      expect(validator.validate('123456789')).toBe(false);
      expect(validator.validate('123456789012')).toBe(false);
    });

    it('should return false for CPF with all same digits', () => {
      expect(validator.validate('11111111111')).toBe(false);
      expect(validator.validate('00000000000')).toBe(false);
      expect(validator.validate('22222222222')).toBe(false);
    });

    it('should return false for CPF with invalid check digits', () => {
      expect(validator.validate('12345678900')).toBe(false);
      expect(validator.validate('12345678901')).toBe(false);
      expect(validator.validate('11144477736')).toBe(false);
    });

    it('should return false for empty or null CPF', () => {
      expect(validator.validate('')).toBe(false);
      expect(validator.validate(null as any)).toBe(false);
      expect(validator.validate(undefined as any)).toBe(false);
    });

    it('should return false for CPF with non-numeric characters only', () => {
      expect(validator.validate('abc.def.ghi-jk')).toBe(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return default error message', () => {
      expect(validator.defaultMessage()).toBe('CPF is invalid');
    });
  });
});
