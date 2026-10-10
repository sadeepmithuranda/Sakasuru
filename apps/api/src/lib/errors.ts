export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export const notFound = (what = "Resource") => new AppError(404, "not_found", `${what} not found`);
export const forbidden = () => new AppError(403, "forbidden", "You don't have permission to do that");
export const unauthorized = (code = "unauthorized") => new AppError(401, code, "Authentication required");
export const conflict = (code: string, msg?: string) => new AppError(409, code, msg);
export const badRequest = (code: string, msg?: string) => new AppError(400, code, msg);
