import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new LoginDto();
    dto.email = 'john@example.com';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when email is invalid', async () => {
    const dto = new LoginDto();
    dto.email = 'invalid-email';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail validation when email is empty', async () => {
    const dto = new LoginDto();
    dto.email = '';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail validation when password is empty', async () => {
    const dto = new LoginDto();
    dto.email = 'john@example.com';
    dto.password = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail validation when both fields are empty', async () => {
    const dto = new LoginDto();
    dto.email = '';
    dto.password = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.length).toBe(2);
  });
});
