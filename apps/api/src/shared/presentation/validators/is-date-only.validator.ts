import { type ValidationOptions, registerDecorator } from 'class-validator';
import { parseDateOnly } from '../date-format.js';

export function IsDateOnly(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: 'isDateOnly',
      target: target.constructor,
      propertyName: propertyName.toString(),
      options: {
        message: '$property must be a valid date in the format YYYY-MM-DD',
        ...options,
      },
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && parseDateOnly(value) !== null,
      },
    });
  };
}
