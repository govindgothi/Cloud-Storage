import { z } from "zod";
import { parentId } from "./common/common.validations.js";

export const fileSchema = z.object({
  parentId:parentId,
  userId: z.number().int().positive(),
  filename: z.string().min(3, "Filename is required"),
  type: z.string().min(3, "File type is required"),
  size: z.number().nonnegative(),
  lastModified: z.number().int().nonnegative(),
  lastModifiedDate: z.coerce.date(),
});

export type FileInput = z.infer<typeof fileSchema>;