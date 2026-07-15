import { z } from "zod";
import { parentId } from "./common/common.validations.js";

export const directorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(255, "Folder name is too long"),

  parentId: parentId,
});

export type DirectoryInput = z.infer<typeof directorySchema>;

export const getAllDirectorySchema = z.object({
  parentId: parentId,
});