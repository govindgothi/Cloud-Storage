
import { Request, Response, NextFunction } from "express";

import { formatZodError } from "../../validations/common/zodFormatError.validations.js";
import { ZodType   } from "zod";

export const validate =
  <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      return res.status(400).json(formatZodError(result.error));
    }
    // attach validated data (important)
    req.body = result.data;
    next();
  };