import { HttpException, HttpStatus } from '@nestjs/common';
import { CentralLogType } from './central-log.types';

export const buildCentralLogMessage = (
  message?: string,
  technicalMessage?: string,
): string => {
  const parts: string[] = [];
  const userLog = message?.trim();
  const technicalLog = technicalMessage?.trim();

  if (userLog) parts.push(userLog);
  if (technicalLog) parts.push(technicalLog);

  return parts.join('\n');
};

export const normalizeCentralLogType = (
  type?: unknown,
): CentralLogType | null => {
  switch (type) {
    case 'Fatal':
    case 'fatal':
      return 'fatal';
    case 'Failure':
    case 'error':
    case 'failure':
      return 'error';
    case 'Warning':
    case 'warning':
      return 'warning';
    case 'Success':
    case 'success':
      return 'success';
    default:
      return null;
  }
};

export const mapResponseTypeToLogType = (type?: unknown): CentralLogType =>
  normalizeCentralLogType(type) ?? 'success';

const getRecordType = (value: unknown): unknown => {
  if (!value || typeof value !== 'object' || !('type' in value))
    return undefined;

  return (value as { type?: unknown }).type;
};

export const getExceptionResponseType = (exception: unknown): unknown => {
  if (exception instanceof HttpException) {
    return getRecordType(exception.getResponse());
  }

  if (!exception || typeof exception !== 'object') {
    return undefined;
  }

  const asRecord = exception as {
    body?: unknown;
    response?: unknown;
  };

  return (
    getRecordType(asRecord.body) ??
    getRecordType(asRecord.response) ??
    (asRecord.response && typeof asRecord.response === 'object'
      ? getRecordType((asRecord.response as { body?: unknown }).body)
      : undefined)
  );
};

export const getErrorStatus = (exception: unknown): number =>
  exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;

export const mapExceptionToLogType = (
  exception: unknown,
  responseType: unknown = getExceptionResponseType(exception),
): CentralLogType => {
  const normalizedResponseType = normalizeCentralLogType(responseType);
  if (normalizedResponseType) return normalizedResponseType;

  return getErrorStatus(exception) >= 500 ? 'fatal' : 'error';
};

export const normalizeExceptionMessage = (exception: unknown): string => {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();

    if (typeof response === 'string') return response;
    if (response && typeof response === 'object') {
      const message = normalizeMessageValue(response);
      const technicalMessage = normalizeTechnicalMessageValue(response);
      const centralLogMessage = buildCentralLogMessage(
        message !== 'Internal server error' ? message : undefined,
        technicalMessage,
      );

      if (centralLogMessage) return centralLogMessage;
    }

    return exception.message || 'Internal server error';
  }

  if (exception instanceof Error) return exception.stack || exception.message;

  return String(exception);
};

export const normalizeClientErrorMessage = (exception: unknown): string => {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    const normalizedMessage = normalizeMessageValue(response);

    if (normalizedMessage && normalizedMessage !== 'Internal server error') {
      return normalizedMessage;
    }

    return exception.message || 'Internal server error';
  }

  if (exception instanceof Error) {
    return exception.message || 'Internal server error';
  }

  return 'Internal server error';
};

export const normalizeClientResponseType = (
  responseType: unknown,
): string | null => (typeof responseType === 'string' ? responseType : null);

const normalizeMessageValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(String).join(', ');
  if (value && typeof value === 'object' && 'message' in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.map(String).join(', ');
  }

  return 'Internal server error';
};

const normalizeTechnicalMessageValue = (value: unknown): string | undefined => {
  if (!value || typeof value !== 'object' || !('technicalMessage' in value)) {
    return undefined;
  }

  const technicalMessage = (value as { technicalMessage?: unknown })
    .technicalMessage;

  return typeof technicalMessage === 'string' ? technicalMessage : undefined;
};
