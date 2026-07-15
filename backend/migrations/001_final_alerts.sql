-- Hybrid SOC Final Alert schema.
--
-- This migration defines the application/RDS contract. Adding this file does
-- not mean it has been applied to any database. Run it through an approved,
-- audited deployment process using a migration role, not the runtime role.

BEGIN;

CREATE TABLE IF NOT EXISTS final_alerts (
    alert_id           TEXT        PRIMARY KEY,
    event_id           TEXT        NOT NULL,
    event_timestamp    TIMESTAMPTZ,
    severity           TEXT,
    attack_type        TEXT,
    final_label        TEXT,
    risk_score         NUMERIC(7, 4),
    confidence_score   NUMERIC(7, 6),
    source_ip          TEXT,
    destination_ip     TEXT,
    evidence_summary   JSONB,
    raw_s3_uri         TEXT,
    evidence_s3_uri    TEXT,
    payload             JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keep the migration useful when an earlier thin-slice table already exists.
-- Existing application columns are intentionally not retyped here.
ALTER TABLE final_alerts
    ADD COLUMN IF NOT EXISTS event_timestamp TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS evidence_summary JSONB,
    ADD COLUMN IF NOT EXISTS raw_s3_uri TEXT,
    ADD COLUMN IF NOT EXISTS evidence_s3_uri TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- PostgreSQL can infer this unique index for ON CONFLICT (event_id). If legacy
-- data contains duplicate event_id values, this statement must fail so the data
-- can be reconciled instead of silently discarding alerts.
CREATE UNIQUE INDEX IF NOT EXISTS ux_final_alerts_event_id
    ON final_alerts (event_id);

CREATE INDEX IF NOT EXISTS ix_final_alerts_event_timestamp
    ON final_alerts (event_timestamp DESC);

CREATE INDEX IF NOT EXISTS ix_final_alerts_created_at
    ON final_alerts (created_at DESC);

-- Supports ordered incremental polling with a stable tie-breaker. A single-column
-- updated_at index cannot resume safely when multiple rows share a timestamp.
CREATE INDEX IF NOT EXISTS ix_final_alerts_updated_at_event_id
    ON final_alerts (updated_at, event_id);

CREATE INDEX IF NOT EXISTS ix_final_alerts_severity_created_at
    ON final_alerts (severity, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_alerts_source_ip_created_at
    ON final_alerts (source_ip, created_at DESC);

-- Preserve the original creation time even though an older application upsert
-- assigns created_at = now(). updated_at is the authoritative modification time.
CREATE OR REPLACE FUNCTION final_alerts_set_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.created_at := OLD.created_at;
    END IF;
    -- clock_timestamp() reflects the actual row-change time. now() is fixed at
    -- transaction start and can move the cursor backwards during a slow write.
    NEW.updated_at := clock_timestamp();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_final_alerts_set_timestamps ON final_alerts;

CREATE TRIGGER trg_final_alerts_set_timestamps
BEFORE INSERT OR UPDATE ON final_alerts
FOR EACH ROW
EXECUTE FUNCTION final_alerts_set_timestamps();

COMMENT ON COLUMN final_alerts.event_id IS
    'Stable idempotency key from the normalized telemetry event.';
COMMENT ON COLUMN final_alerts.event_timestamp IS
    'Timestamp of the observed security event, not the database insert time.';
COMMENT ON COLUMN final_alerts.evidence_summary IS
    'Compact structured evidence suitable for alert list/detail queries.';
COMMENT ON COLUMN final_alerts.raw_s3_uri IS
    's3:// URI for the immutable raw telemetry artifact, when available.';
COMMENT ON COLUMN final_alerts.evidence_s3_uri IS
    's3:// URI for the alert evidence package, when available.';
COMMENT ON COLUMN final_alerts.payload IS
    'Complete versioned Final Alert DTO returned by the API.';

COMMIT;
