import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string, args: ValidationArguments): boolean {
    if (!dateString) {
      return false;
    }

    const inputDate = new Date(dateString);
    const now = new Date();

    // Check if date is valid
    if (isNaN(inputDate.getTime())) {
      return false;
    }

    // Check if date is in the future
    return inputDate > now;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'A data de encerramento deve ser futura';
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}
