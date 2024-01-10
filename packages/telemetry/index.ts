import { randomBytes } from 'node:crypto';
import { isCI } from './utils/is-ci';
import { GlobalConfig } from './config';
import { post } from './post';
import { getProjectInfo, type ProjectInfo } from './project-info';
import { getSystemInfo, type SystemInfo } from './system-info';

export interface TelemetryEvent {
  event: string;
  payload: Record<string, any>;
}

export class MillionTelemetry {
  private _anonymousSessionId: string | undefined;
  private _anonymousProjectInfo: ProjectInfo | undefined;
  private config = new GlobalConfig({ name: 'million' });
  private isCI = isCI;

  constructor(private TELEMETRY_DISABLED = false) {
    this.TELEMETRY_DISABLED = TELEMETRY_DISABLED;
  }

  private getConfigWithFallback<T>(key: string, getValue: () => T): T {
    const currentValue = this.config.get(key);
    if (currentValue !== undefined) {
      return currentValue;
    }
    const newValue = getValue();
    this.config.set(key, newValue);
    return newValue;
  }

  private get enabled(): boolean {
    return this.getConfigWithFallback('telemetry_enabled', () => true);
  }

  private get anonymousId(): string {
    return this.getConfigWithFallback('telemetry_anonymousId', () =>
      randomBytes(32).toString('hex'),
    );
  }

  private get anonymousSessionId(): string {
    this._anonymousSessionId =
      this._anonymousSessionId || randomBytes(32).toString('hex');
    return this._anonymousSessionId;
  }

  private get anonymousProjectInfo(): ProjectInfo {
    this._anonymousProjectInfo =
      this._anonymousProjectInfo || getProjectInfo(this.isCI);
    return this._anonymousProjectInfo;
  }

  private get isDisabled(): boolean {
    if (this.TELEMETRY_DISABLED) {
      return true;
    }
    return !this.enabled;
  }

  setEnabled(value: boolean): void {
    this.config.set('telemetry_enabled', value);
  }

  clear(): void {
    this.config.clear();
  }

  record({ event, payload }: TelemetryEvent): Promise<void> {
    if (this.isDisabled) {
      return Promise.resolve();
    }

    const meta: SystemInfo = getSystemInfo();

    return post({
      event,
      anonymousId: meta.isCI
        ? this.anonymousId
        : `CI.${meta.ciName || 'UNKNOWN'}`,
      anonymousSessionId: this.anonymousSessionId,
      payload,
      meta,
    });
  }
}