import type { Request } from 'express';

export type CentralLogType = 'fatal' | 'error' | 'warning' | 'success';

export type ReportedMethod = 'POST' | 'PUT' | 'DELETE';

export type DabaRequest = Request & {
  date?: string;
  username?: string;
  centralLogReported?: boolean;
};

export type ResponseShape<T> = {
  success: boolean;
  statusCode: number;
  body: {
    data: T;
    message: string;
    type?: unknown;
    technicalMessage?: string;
  };
};

export type SplitResponsePayload = {
  data: unknown;
  message: string;
  type: string;
  technicalMessage?: string;
};

export type CentralLogPayload = {
  application: string;
  username: string;
  occurredAt: string;
  message: string;
  requestMethod: string;
  type: CentralLogType;
  requestPath: string;
};
