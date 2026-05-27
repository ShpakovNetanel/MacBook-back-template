import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CentralLogPayload } from '../logging/central-log.types';

@Injectable()
export class CentralLogReporterService {
  private readonly logger = new Logger(CentralLogReporterService.name);

  constructor(private readonly configService: ConfigService) {}

  report(payload: Omit<CentralLogPayload, 'application' | 'occurredAt'>): void {
    if (!payload.message.trim()) return;

    const endpoint = this.getEndpoint();
    if (!endpoint) return;

    const body: CentralLogPayload = {
      application: this.getApplicationName(),
      occurredAt: new Date().toISOString(),
      ...payload,
    };

    void this.postLog(endpoint, body);
  }

  private getApplicationName(): string {
    return 'דרישות והקצאות';
  }

  private getEndpoint(): string | null {
    const baseUrl = this.configService.get<string>('LOGS_SERVICE_HOST',);
    const normalizedBaseUrl = baseUrl?.trim().replace(/\/$/, '');

    return normalizedBaseUrl ? `${normalizedBaseUrl}/api/logs` : null;
  }

  private getTimeoutMs(): number {
    const timeout = Number(
      this.configService.get<string>('LOGS_SERVICE_TIMEOUT_MS', '1500'),
    );

    return Number.isFinite(timeout) && timeout > 0 ? timeout : 1500;
  }

  private async postLog(
    endpoint: string,
    payload: CentralLogPayload,
  ): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.getTimeoutMs());

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.debug(
          `Central log request failed with status ${response.status}`,
        );
      }
    } catch (error) {
      this.logger.debug(
        `Failed to report central log: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
