import { validate } from 'class-validator';
import { CreateClientDto } from './create-client.dto';

describe('CreateClientDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateClientDto();
    dto.name = 'John Doe';
    dto.email = 'john@example.com';
    dto.password = 'password123';
    dto.cpf = '12345678909';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when name is empty', async () => {
    const dto = new CreateClientDto();
    dto.name = '';
    dto.email = 'john@example.com';
    dto.password = 'password123';
    dto.cpf = '12345678909';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail validation when email is invalid', async () => {
    const dto = new CreateClientDto();
    dto.name = 'John Doe';
    dto.email = 'invalid-email';
    dto.password = 'password123';
    dto.cpf = '12345678909';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail validation when password is too short', async () => {
    const dto = new CreateClientDto();
    dto.name = 'John Doe';
    dto.email = 'john@example.com';
    dto.password = '12345';
    dto.cpf = '12345678909';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail validation when CPF is invalid', async () => {
    const dto = new CreateClientDto();
    dto.name = 'John Doe';
    dto.email = 'john@example.com';
    dto.password = 'password123';
    dto.cpf = '12345678900';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('cpf');
  });

  it('should fail validation when CPF has invalid length', async () => {
    const dto = new CreateClientDto();
    dto.name = 'John Doe';
    dto.email = 'john@example.com';
    dto.password = 'password123';
    dto.cpf = '123456789';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('cpf');
  });

  it('should fail validation when CPF has all same digits', async () => {
    const dto = new CreateClientDto();
    dto.name = 'John Doe';
    dto.email = 'john@example.com';
    dto.password = 'password123';
    dto.cpf = '11111111111';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('cpf');
  });

  it('should pass validation with formatted CPF', async () => {
    const dto = new CreateClientDto();
    dto.name = 'John Doe';
    dto.email = 'john@example.com';
    dto.password = 'password123';
    dto.cpf = '123.456.789-09';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
