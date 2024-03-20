export type APIResponse<T = any> = {
  status: "success" | "error";
  statusCode: number;
  data?: T[] | T;
  error?: APIError;
};

export type APIError = {
  code: string;
  message: string;
  details: string;
};

export interface IErrorCodeMessageMap {
  [key: number]: {
    code: string;
    message: string;
  };
}
