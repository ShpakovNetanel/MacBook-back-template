import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

type ResponseShape<T> = {
  success: boolean;
  statusCode: number;
  body: {
    data: T;
    message: string;
  };
};

const isResponseShape = (value: unknown): value is ResponseShape<unknown> => {
  if (!value || typeof value !== "object") return false;
  const asRecord = value as Record<string, unknown>;
  if (typeof asRecord.success !== "boolean") return false;
  if (typeof asRecord.statusCode !== "number") return false;
  const body = asRecord.body as Record<string, unknown> | undefined;
  if (!body || typeof body !== "object") return false;
  if (!("data" in body)) return false;
  if (typeof body.message !== "string") return false;
  return true;
};

const splitMessageAndData = (
  value: unknown
): { data: unknown; message: string } | null => {
  if (!value || typeof value !== "object") return null;
  const asRecord = value as Record<string, unknown>;
  if (!("data" in asRecord) || !("message" in asRecord)) return null;
  const message = asRecord.message;
  if (typeof message !== "string") return null;
  const keys = Object.keys(asRecord);
  if (keys.length > 2) return null;
  return { data: asRecord.data, message };
};

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpResponse = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        if (isResponseShape(data)) return data;
        const split = splitMessageAndData(data);
        return {
          success: true,
          statusCode: httpResponse?.statusCode ?? 200,
          body: {
            data: split ? split.data : data,
            message: split?.message ?? "OK",
          },
        };
      })
    );
  }
}
