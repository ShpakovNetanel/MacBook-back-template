import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  buildCentralLogMessage,
  getExceptionResponseType,
  mapExceptionToLogType,
  mapResponseTypeToLogType,
  normalizeExceptionMessage,
} from '../logging/central-log-message.utils';
import {
  getRequestPath,
  getUsername,
  shouldSkipCentralLogRequest,
} from '../logging/central-log-request.utils';
import { DabaRequest, ResponseShape } from '../logging/central-log.types';
import {
  createResponseShape,
  isResponseShape,
} from '../logging/response-shape.utils';
import { CentralLogReporterService } from '../services/central-log-reporter.service';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly centralLogReporter: CentralLogReporterService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<DabaRequest>();
    const httpResponse = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        if (isResponseShape(data)) {
          this.reportSuccess(request, data);
          return data;
        }

        const response = createResponseShape(
          data,
          httpResponse?.statusCode ?? 200,
        );

        this.reportSuccess(request, response);
        return response;
      }),
      catchError((exception) => {
        this.reportError(
          request,
          exception,
          getExceptionResponseType(exception),
        );
        return throwError(() => exception);
      }),
    );
  }

  private reportSuccess(
    request: DabaRequest,
    response: ResponseShape<unknown>,
  ): void {
    if (shouldSkipCentralLogRequest(request)) return;

    const method = request.method ?? 'REQUEST';
    const requestPath = getRequestPath(request);
    const centralLogMessage = buildCentralLogMessage(
      response.body.message,
      response.body.technicalMessage,
    );
    if (!centralLogMessage) return;

    const logType = mapResponseTypeToLogType(response.body.type);

    this.centralLogReporter.report({
      username: getUsername(request),
      requestPath,
      type: logType,
      requestMethod: method,
      message: centralLogMessage,
    });
  }

  private reportError(
    request: DabaRequest,
    exception: unknown,
    responseType: unknown,
  ): void {
    if (shouldSkipCentralLogRequest(request)) return;

    request.centralLogReported = true;

    const requestPath = getRequestPath(request);
    const message = normalizeExceptionMessage(exception);

    this.centralLogReporter.report({
      username: getUsername(request),
      requestPath,
      requestMethod: request.method ?? 'REQUEST',
      type: mapExceptionToLogType(exception, responseType),
      message,
    });
  }
}
