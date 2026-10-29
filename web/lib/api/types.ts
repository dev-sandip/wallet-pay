export type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  data: T;
};

export type ApiErrorResponse = {
  statusCode: number;
  message: string;
  timestamp: string;
};
