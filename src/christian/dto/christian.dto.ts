import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const createChristianSchema = z.object({
  email: z.string().email().nonempty(),
  gender: z.string().nonempty(),
  role: z.string().optional(),
  firstname: z.string().nonempty(),
  lastname: z.string().nonempty(),
  telephone: z.string().optional(),
  uniqueCode: z.string().optional(),
  fatherName: z.string().nonempty(),
  motherName: z.string().nonempty(),
  province: z.string().nonempty(),
  district: z.string().nonempty(),
  home: z.string().nonempty(),
  dob: z.string(),
  baptismDate: z.string().optional(),
  confirmationDate: z.string().optional(),
  euchuristicDate: z.string().optional(),
  marriageDate: z.string().optional(),
  godParent: z.string().optional(),
});

const makeApplicationSchema = z.object({
  type: z.string().nonempty(),
  massDate: z.string().optional(),
  relationship: z.string().optional(),
  uniqueCode: z.string().optional(),
});

export class createChristianDto extends createZodDto(createChristianSchema) {}
export class makeApplicationDto extends createZodDto(makeApplicationSchema) {}
