import { isDefined } from 'remeda';
import { ResponseShape, SplitResponsePayload } from './central-log.types';

export const isResponseShape = (
  value: unknown,
): value is ResponseShape<unknown> => {
  if (!value || typeof value !== 'object') return false;
  const asRecord = value as Record<string, unknown>;
  if (typeof asRecord.success !== 'boolean') return false;
  if (typeof asRecord.statusCode !== 'number') return false;

  const body = asRecord.body as Record<string, unknown> | undefined;
  if (!body || typeof body !== 'object') return false;
  if (!('data' in body)) return false;
  if (typeof body.message !== 'string') return false;
  if (
    isDefined(body.technicalMessage) &&
    typeof body.technicalMessage !== 'string'
  ) {
    return false;
  }

  return true;
};

export const splitMessageAndData = (
  value: unknown,
): SplitResponsePayload | null => {
  if (!value || typeof value !== 'object') return null;
  const asRecord = value as Record<string, unknown>;
  if (!('message' in asRecord) || !('type' in asRecord)) return null;

  const message = asRecord.message;
  if (typeof message !== 'string') return null;

  const type = asRecord.type;
  if (typeof type !== 'string') return null;

  const technicalMessage = asRecord.technicalMessage;
  if (isDefined(technicalMessage) && typeof technicalMessage !== 'string')
    return null;

  const keys = Object.keys(asRecord);
  const validKeys = keys.every((key) =>
    ['data', 'message', 'type', 'technicalMessage'].includes(key),
  );
  if (!validKeys) return null;

  return {
    data: asRecord.data ?? [],
    message,
    type,
    ...(technicalMessage ? { technicalMessage } : {}),
  };
};

export const createResponseShape = (
  data: unknown,
  statusCode: number,
): ResponseShape<unknown> => {
  const split = splitMessageAndData(data);

  return {
    success: true,
    statusCode,
    body: {
      data: split ? split.data : isDefined(data) ? data : [],
      message: split?.message ?? '',
      ...(split ? { type: split.type } : {}),
      ...(split?.technicalMessage
        ? { technicalMessage: split.technicalMessage }
        : {}),
    },
  };
};
