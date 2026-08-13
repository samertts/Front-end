export type GulaEventType =
  | 'identity.subject.mapped'
  | 'workforce.attendance.recorded'
  | 'workforce.assignment.changed'
  | 'sample.custody.transitioned'
  | 'device.observation.pending';

export interface GulaIntegrationEnvelope<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  event_id: string;
  event_type: GulaEventType;
  schema_version: number;
  source_service: string;
  tenant_id: string;
  occurred_at: string;
  actor_id: string;
  entity_id: string;
  correlation_id: string;
  idempotency_key: string;
  payload: TPayload;
}

export function createIdempotencyKey(entityId: string, eventType: GulaEventType, version = 1): string {
  if (!entityId.trim() || !eventType.trim() || version < 1) {
    throw new Error('entityId, eventType, and positive version are required');
  }
  return `${eventType}:${entityId}:v${version}`;
}

export function assertGulaEnvelope(value: unknown): asserts value is GulaIntegrationEnvelope {
  if (!value || typeof value !== 'object') throw new Error('GULA envelope must be an object');
  const envelope = value as Partial<GulaIntegrationEnvelope>;
  const required = [
    'event_id',
    'event_type',
    'schema_version',
    'source_service',
    'tenant_id',
    'occurred_at',
    'actor_id',
    'entity_id',
    'correlation_id',
    'idempotency_key',
    'payload',
  ] as const;
  for (const field of required) {
    if (envelope[field] === undefined || envelope[field] === null || envelope[field] === '') {
      throw new Error(`GULA envelope is missing ${field}`);
    }
  }
  if (!Number.isInteger(envelope.schema_version) || envelope.schema_version < 1) {
    throw new Error('GULA envelope schema_version must be a positive integer');
  }
  if (Number.isNaN(Date.parse(envelope.occurred_at as string))) {
    throw new Error('GULA envelope occurred_at must be an ISO timestamp');
  }
}
