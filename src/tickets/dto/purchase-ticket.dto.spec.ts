import { validate } from 'class-validator';
import { PurchaseTicketDto } from './purchase-ticket.dto';

describe('PurchaseTicketDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new PurchaseTicketDto();
    dto.raffleId = '550e8400-e29b-41d4-a716-446655440000';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if raffleId is missing', async () => {
    const dto = new PurchaseTicketDto();

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('raffleId');
  });

  it('should fail validation if raffleId is not a UUID', async () => {
    const dto = new PurchaseTicketDto();
    dto.raffleId = 'not-a-uuid';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('raffleId');
  });

  it('should fail validation if raffleId is empty string', async () => {
    const dto = new PurchaseTicketDto();
    dto.raffleId = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('raffleId');
  });
});
