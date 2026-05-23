import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';
import {
  getErrorStatus,
  getExceptionResponseType,
  mapExceptionToLogType,
  normalizeClientErrorMessage,
  normalizeClientResponseType,
} from '../logging/central-log-message.utils';
import {
  getRequestPath,
  getUsername,
  shouldSkipCentralLogRequest,
} from '../logging/central-log-request.utils';
import { DabaRequest } from '../logging/central-log.types';
import { CentralLogReporterService } from '../services/central-log-reporter.service';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly centralLogReporter: CentralLogReporterService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<DabaRequest>();
    const response = ctx.getResponse();

    const status = getErrorStatus(exception);
    const responseType = getExceptionResponseType(exception);
    const normalizedType = normalizeClientResponseType(responseType);
    const message = normalizeClientErrorMessage(exception);

    this.reportUnhandledException(
      request,
      status,
      message,
      exception,
      responseType,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      body: {
        data: null,
        message,
        ...(normalizedType ? { type: normalizedType } : {}),
      },
    });
  }

  private reportUnhandledException(
    request: DabaRequest,
    status: number,
    message: string,
    exception: unknown,
    responseType: unknown,
  ): void {
    if (request.centralLogReported || shouldSkipCentralLogRequest(request))
      return;

    request.centralLogReported = true;

    this.centralLogReporter.report({
      username: getUsername(request),
      requestPath: getRequestPath(request),
      requestMethod: request.method ?? 'REQUEST',
      type: mapExceptionToLogType(exception, responseType),
      message: `${request.method ?? 'REQUEST'} ${getRequestPath(request)} נכשל (${status}).\n${
        exception instanceof Error ? exception.stack || message : message
      }`,
    });
  }
}
