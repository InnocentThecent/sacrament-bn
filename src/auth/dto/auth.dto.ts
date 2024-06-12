import { ROLE_ENUM } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const loginSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  password: z.string(),
});

const registerSchema = loginSchema.extend({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  gender: z.string().optional(),
  telephone: z.string().length(10),
  age: z
    .string()
    .transform((a) => Number(a))
    .refine(
      (a) => {
        return a > 18;
      },
      {
        message: 'patient should at least 18 years old',
      },
    ),
  password: z
    .string()
    .optional()
    .refine(
      (password) => {
        const capitalLetterRegex = /[A-Z]/;
        const numberRegex = /[0-9]/;
        const specialCharacterRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;

        return (
          capitalLetterRegex.test(password) &&
          numberRegex.test(password) &&
          specialCharacterRegex.test(password)
        );
      },
      {
        message:
          'Password must include at least one capital letter, one number, and one special character',
      },
    ),
});

export class loginDto extends createZodDto(loginSchema) {}
export class registerDto extends createZodDto(registerSchema) {}
