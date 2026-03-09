import { validate } from 'class-validator';
import { CreateRaffleDto } from './create-raffle.dto';

describe('CreateRaffleDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateRaffleDto();
    dto.title = 'Rifa Teste';
    dto.description = 'Descrição da rifa';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    dto.closingDate = futureDate.toISOString();
    dto.ticketPrice = 10.5;
    dto.maxTickets = 100;

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation when title is empty', async () => {
    const dto = new CreateRaffleDto();
    dto.title = '';
    dto.description = 'Descrição da rifa';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    dto.closingDate = futureDate.toISOString();
    dto.ticketPrice = 10.5;
    dto.maxTickets = 100;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
  });

  it('should fail validation when description is empty', async () => {
    const dto = new CreateRaffleDto();
    dto.title = 'Rifa Teste';
    dto.description = '';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    dto.closingDate = futureDate.toISOString();
    dto.ticketPrice = 10.5;
    dto.maxTickets = 100;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
  });

  it('should fail validation when closingDate is in the past', async () => {
    const dto = new CreateRaffleDto();
    dto.title = 'Rifa Teste';
    dto.description = 'Descrição da rifa';
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    dto.closingDate = pastDate.toISOString();
    dto.ticketPrice = 10.5;
    dto.maxTickets = 100;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const closingDateError = errors.find((e) => e.property === 'closingDate');
    expect(closingDateError).toBeDefined();
  });

  it('should fail validation when closingDate is not a valid date string', async () => {
    const dto = new CreateRaffleDto();
    dto.title = 'Rifa Teste';
    dto.description = 'Descrição da rifa';
    dto.closingDate = 'invalid-date';
    dto.ticketPrice = 10.5;
    dto.maxTickets = 100;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const closingDateError = errors.find((e) => e.property === 'closingDate');
    expect(closingDateError).toBeDefined();
  });

  it('should fail validation when ticketPrice is zero', async () => {
    const dto = new CreateRaffleDto();
    dto.title = 'Rifa Teste';
    dto.description = 'Descrição da rifa';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    dto.closingDate = futureDate.toISOString();
    dto.ticketPrice = 0;
    dto.maxTickets = 100;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const priceError = errors.find((e) => e.property === 'ticketPrice');
    expect(priceError).toBeDefined();
  });

  it('should fail validation when ticketPrice is negative', async () => {
    const dto = new CreateRaffleDto();
    dto.title = 'Rifa Teste';
    dto.description = 'Descrição da rifa';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    dto.closingDate = futureDate.toISOString();
    dto.ticketPrice = -10;
    dto.maxTickets = 100;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const priceError = errors.find((e) => e.property === 'ticketPrice');
    expect(priceError).toBeDefined();
  });

  it('should fail validation when maxTickets is zero', async () => {
    const dto = new CreateRaffleDto();
    dto.title = 'Rifa Teste';
    dto.description = 'Descrição da rifa';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    dto.closingDate = futureDate.toISOString();
    dto.ticketPrice = 10.5;
    dto.maxTickets = 0;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const maxTicketsError = errors.find((e) => e.property === 'maxTickets');
    expect(maxTicketsError).toBeDefined();
  });

  it('should fail validation when maxTickets is negative', async () => {
    const dto = new CreateRaffleDto();
    dto.title = 'Rifa Teste';
    dto.description = 'Descrição da rifa';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    dto.closingDate = futureDate.toISOString();
    dto.ticketPrice = 10.5;
    dto.maxTickets = -5;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const maxTicketsError = errors.find((e) => e.property === 'maxTickets');
    expect(maxTicketsError).toBeDefined();
  });

  it('should pass validation with optional imageUrl', async () => {
    const dto = new CreateRaffleDto();
    dto.title = 'Rifa Teste';
    dto.description = 'Descrição da rifa';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    dto.closingDate = futureDate.toISOString();
    dto.ticketPrice = 10.5;
    dto.maxTickets = 100;
    dto.imageUrl = 'https://example.com/image.jpg';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation without imageUrl', async () => {
    const dto = new CreateRaffleDto();
    dto.title = 'Rifa Teste';
    dto.description = 'Descrição da rifa';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    dto.closingDate = futureDate.toISOString();
    dto.ticketPrice = 10.5;
    dto.maxTickets = 100;

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
