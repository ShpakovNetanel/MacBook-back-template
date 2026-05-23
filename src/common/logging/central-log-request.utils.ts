import { DabaRequest, ReportedMethod } from './central-log.types';

const REPORTED_METHODS = new Set<ReportedMethod>(['POST', 'PUT', 'DELETE']);

export const getUsername = (request: DabaRequest): string =>
  request.username ?? '';

export const getRequestPath = (request: DabaRequest): string =>
  request.originalUrl || request.url || request.path || '/';

export const shouldReportMethod = (method?: string): method is ReportedMethod =>
  REPORTED_METHODS.has(method?.toUpperCase() as ReportedMethod);

export const shouldSkipCentralLogRequest = (request: DabaRequest): boolean => {
  const path = getRequestPath(request);

  return (
    !shouldReportMethod(request.method) ||
    path.startsWith('/api-docs') ||
    path.startsWith('/server-time')
  );
};
