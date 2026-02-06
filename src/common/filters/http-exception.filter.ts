import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

const normalizeMessage = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.map(String).join(", ");
  }
  return "Internal server error";
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const normalized =
      exception instanceof HttpException
        ? normalizeMessage(exception.getResponse())
        : null;

    const message =
      normalized && normalized !== "Internal server error"
        ? normalized
        : exception instanceof HttpException
          ? exception.message || "Internal server error"
          : exception instanceof Error
            ? exception.message || "Internal server error"
            : "Internal server error";

    response.status(status).json({
      success: false,
      statusCode: status,
      body: {
        data: null,
        message,
      },
    });
  }
}
