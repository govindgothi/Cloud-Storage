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


export const AuthMessages = {
  INVALID_OTP_TYPE: "Invalid OTP type",
  INVALID_OTP: "Invalid OTP",
  OTP_EXPIRED: "OTP has expired",
} as const;