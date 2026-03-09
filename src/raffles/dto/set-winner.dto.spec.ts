import { validate } from 'class-validator';
import { SetWinnerDto } from './set-winner.dto';

describe('SetWinnerDto', () => {
  it('should validate a valid winning number', async () => {
    const dto = new SetWinnerDto();
    dto.winningNumber = 42;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if winningNumber is not provided', async () => {
    const dto = new SetWinnerDto();

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('winningNumber');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail if winningNumber is not an integer', async () => {
    const dto = new SetWinnerDto();
    dto.winningNumber = 42.5 as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('winningNumber');
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('should fail if winningNumber is less than 1', async () => {
    const dto = new SetWinnerDto();
    dto.winningNumber = 0;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('winningNumber');
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('should fail if winningNumber is negative', async () => {
    const dto = new SetWinnerDto();
    dto.winningNumber = -5;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('winningNumber');
    expect(errors[0].constraints).toHaveProperty('min');
  });
});
