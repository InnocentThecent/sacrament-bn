import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const createUserSchema = z.object({
  email: z.string().email().nonempty(),
  gender: z.string().nonempty(),
  role: z.string().optional(),
  firstname: z.string().nonempty(),
  lastname: z.string().nonempty(),
  telephone: z.string().nonempty(),
  uniqueCode: z.string().nonempty(),
});

const updateParishInfoSchema = z.object({
  parishName: z.string().nonempty(),
  diocese: z.string().nonempty(),
  offeringAmount: z.any().transform((val) => Number(val)),
});

export class createUserDto extends createZodDto(createUserSchema) {}
export class updateParishInfoDto extends createZodDto(updateParishInfoSchema) {}
