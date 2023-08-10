import { z } from 'zod';
import validations from '../utils/validations';

export const userData = () =>
  z.object({
    username: validations.username(),
    password: validations.password(),
  });
