export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};


export const HttpMessage = {
  // 2xx
  OK: "Success",
  CREATED: "Resource created successfully",
  NO_CONTENT: "No content",

  // 4xx
  BAD_REQUEST: "Bad request",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Resource already exists",
  UNPROCESSABLE_ENTITY: "Validation failed",
  UNABLE_TO_PROCESS:"Unable to process request",
  // 5xx
  INTERNAL_SERVER_ERROR: "Internal server error",
};

export const DAY = 24 * 60 * 60; // seconds
