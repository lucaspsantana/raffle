import { validate } from 'class-validator';
import { UpdateRaffleDto } from './update-raffle.dto';

describe('UpdateRaffleDto', () => {
  it('should pass validation with all valid optional fields', async () => {
    const dto = new UpdateRaffleDto();
    dto.title = 'Rifa Atualizada';
    dto.description = 'Nova descrição';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    dto.closingDate = futureDate.toISOString();
    dto.ticketPrice = 15.5;
    dto.maxTickets = 200;
    dto.imageUrl = 'https://example.com/new-image.jpg';
    dto.winnerId = 'winner-uuid';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with empty DTO (all fields optional)', async () => {
    const dto = new UpdateRaffleDto();

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with only title', async () => {
    const dto = new UpdateRaffleDto();
    dto.title = 'Novo Título';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation when closingDate is in the past', async () => {
    const dto = new UpdateRaffleDto();
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    dto.closingDate = pastDate.toISOString();

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const closingDateError = errors.find((e) => e.property === 'closingDate');
    expect(closingDateError).toBeDefined();
  });

  it('should fail validation when closingDate is not a valid date string', async () => {
    const dto = new UpdateRaffleDto();
    dto.closingDate = 'invalid-date';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const closingDateError = errors.find((e) => e.property === 'closingDate');
    expect(closingDateError).toBeDefined();
  });

  it('should fail validation when ticketPrice is zero', async () => {
    const dto = new UpdateRaffleDto();
    dto.ticketPrice = 0;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const priceError = errors.find((e) => e.property === 'ticketPrice');
    expect(priceError).toBeDefined();
  });

  it('should fail validation when ticketPrice is negative', async () => {
    const dto = new UpdateRaffleDto();
    dto.ticketPrice = -10;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const priceError = errors.find((e) => e.property === 'ticketPrice');
    expect(priceError).toBeDefined();
  });

  it('should fail validation when maxTickets is zero', async () => {
    const dto = new UpdateRaffleDto();
    dto.maxTickets = 0;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const maxTicketsError = errors.find((e) => e.property === 'maxTickets');
    expect(maxTicketsError).toBeDefined();
  });

  it('should fail validation when maxTickets is negative', async () => {
    const dto = new UpdateRaffleDto();
    dto.maxTickets = -5;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const maxTicketsError = errors.find((e) => e.property === 'maxTickets');
    expect(maxTicketsError).toBeDefined();
  });

  it('should pass validation with positive ticketPrice', async () => {
    const dto = new UpdateRaffleDto();
    dto.ticketPrice = 25.99;

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with maxTickets greater than zero', async () => {
    const dto = new UpdateRaffleDto();
    dto.maxTickets = 1;

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with winnerId', async () => {
    const dto = new UpdateRaffleDto();
    dto.winnerId = 'some-winner-id';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
