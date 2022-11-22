import { z } from 'zod';

const username = () =>
  z
    .string({
      required_error: 'Missing required parameter: username',
      invalid_type_error: 'Password must be a string',
    })
    .min(3, 'Username must have at least 3 characters');

const password = () =>
  z
    .string({
      required_error: 'Missing required parameter: password',
    })
    .regex(
      /^(?=.*\d)(?=.*[A-Z])[0-9a-zA-Z$*&@#]{8,}$/,
      'Password must has at least 8 characters, 1 number and 1 capital letter'
    );

const from = () =>
  z.string({
    required_error: 'Missing required query parameter: from',
    invalid_type_error: '"From" must be a string',
  });

const to = () =>
  z.string({
    required_error: 'Missing required query parameter: to',
    invalid_type_error: '"To" must be a string',
  });

const ammount = () =>
  z
    .string({
      required_error: 'Missing required query parameter: ammount',
    })
    .transform((val) => Number(val));

const validations = {
  username,
  password,
  from,
  to,
  ammount,
};

export default validations;
