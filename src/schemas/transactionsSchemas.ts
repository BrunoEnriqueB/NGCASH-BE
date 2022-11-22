import { z } from 'zod';
import validations from '../utils/validations';

export const transfer = () =>
  z.object({
    from: validations.from(),
    to: validations.to(),
    ammount: validations.ammount(),
  });
