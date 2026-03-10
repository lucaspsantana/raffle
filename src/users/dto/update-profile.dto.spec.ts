import { validate } from 'class-validator';
import { UpdateProfileDto } from './update-profile.dto';

describe('UpdateProfileDto', () => {
  it('should validate a valid profile update with name', async () => {
    const dto = new UpdateProfileDto();
    dto.name = 'João Silva';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a valid profile update with phone', async () => {
    const dto = new UpdateProfileDto();
    dto.phone = '11987654321';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a valid profile update with password change', async () => {
    const dto = new UpdateProfileDto();
    dto.currentPassword = 'oldPassword123';
    dto.newPassword = 'newPassword123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if name is too short', async () => {
    const dto = new UpdateProfileDto();
    dto.name = 'Jo';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail if phone has invalid format', async () => {
    const dto = new UpdateProfileDto();
    dto.phone = '123'; // muito curto

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('phone');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should fail if new password is too short', async () => {
    const dto = new UpdateProfileDto();
    dto.currentPassword = 'oldPassword';
    dto.newPassword = '123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('newPassword');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should accept phone with 10 digits', async () => {
    const dto = new UpdateProfileDto();
    dto.phone = '1198765432';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept phone with 11 digits', async () => {
    const dto = new UpdateProfileDto();
    dto.phone = '11987654321';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
