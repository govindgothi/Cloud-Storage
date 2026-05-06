import { HttpMessage, HttpStatus } from "../constant/globle.js";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export const successResponse = <T>(
  data: T,
  message: string = HttpMessage.OK,
  statusCode: number = HttpStatus.OK
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
};