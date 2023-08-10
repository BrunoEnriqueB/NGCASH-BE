import { z } from 'zod';
import TransfersFilters from '../domain/TransfersFilters';
import validations from '../utils/validations';

export const transfer = () =>
  z.object({
    from: validations.from(),
    to: validations.to(),
    ammount: validations.ammount(),
  });

export const transferQueryParams = () =>
  z.object({
    filterDate: validations.filterByDate(),
    filterOrder: validations.filterOrder(),
    filterType: validations.filterType(),
  });
