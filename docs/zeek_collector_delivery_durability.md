# Zeek collector delivery durability

## Guarantee boundary

`tail_zeek_correlated_to_backend.py` uses a persistent SQLite outbox for every non-`--dry-run` execution. Once the correlator produces an event, the collector:

1. serializes it as strict JSON (`NaN` and `Infinity` are rejected);
2. commits it to SQLite before any network request;
3. retries POST with bounded exponential backoff;
4. retains it across collector/backend restarts after a failed delivery cycle;
5. deletes it only after an explicitly accepted backend response.

The durable default is one HTTP attempt per delivery cycle. A failed cycle opens a persistent global backoff circuit in the same SQLite database, with a one-second minimum even if intra-request retry delay is configured as zero. While that circuit is open, new events are committed quickly but do not start their own POST/retry loops; this prevents an API outage from blocking the correlator once per incoming event. A later drain retries the oldest eligible event.

The canonical CloudFront/ALB route `/ingest/*` is accepted only with HTTP `202`. The legacy local-lab route, such as `/api/events`, accepts any normal `2xx` response.

This is an **at-least-once delivery** boundary. A response may reach the collector after the backend commits but before SQLite acknowledgment completes, so backend processing must remain idempotent by `event_id`.

## Immutable identity

One `event_id` identifies one immutable payload. Reusing the same `event_id` with different JSON is a fatal integrity error; the collector never overwrites the queued payload. A compact `event_id`/payload-hash identity ledger remains after successful queue deletion, so this protection also applies to future replays and process restarts.

Correlation revisions use separate IDs:

- stable linkage: `correlation_id = zeek:<sensor>:<uid>:<transaction>`;
- immutable delivery ID: `event_id = <correlation_id>:<correlation_status>:<payload-hash>`;
- stable transaction linkage: `transaction_id = <uid>:<transaction>`.

For example, an `http_only` revision and a later `combined` revision have different `event_id` values but the same `correlation_id` and `transaction_id`.

## Configuration

The safe per-user default is:

```text
~/.local/state/hybrid-soc/zeek-collector-outbox.sqlite3
```

For a systemd service, configure persistent service-owned storage explicitly:

```bash
python backend/scripts/tail_zeek_correlated_to_backend.py \
  --zeek-ssh zeek@10.0.0.20 \
  --conn-log /opt/zeek/spool/zeek/conn.log \
  --http-log /opt/zeek/spool/zeek/http.log \
  --api-url https://soc.example.com/ingest/zeek \
  --outbox-path /var/lib/hybrid-soc/zeek-collector-outbox.sqlite3
```

The same path can be set with `ZEEK_COLLECTOR_OUTBOX_PATH`. Its directory must survive service restarts and be writable only by the collector account. Do not place it in `/tmp`, a container's ephemeral layer, or the application checkout.

Useful structured statuses are `outbox_ready`, `outbox_enqueued`, `outbox_duplicate`, `outbox_delivery_deferred`, `posted`, and `collector_fatal_outbox_error`. Heartbeats include `outbox_pending`.

## SSH source limitation

The SQLite guarantee starts **after a row reaches the correlator**. SSH mode still uses remote `tail -n 0 -F`. A disconnect creates a source gap: rows written while SSH is down can be missed, and a rotation can remove them before reconnect. The outbox cannot recover rows it never received, so SSH mode is best-effort and must not be described as lossless.

For production source-level durability, run a checkpointing collector on the Zeek host. It must persist file identity/inode and byte offset, resume from that checkpoint, and retain rotated files until acknowledged. Prefer this local architecture over SSH tailing. The script's current local `--from-start` mode is a finite replay tool, not a continuous checkpointed follower.

## Recovery checks

- Restarting the collector with the same outbox path drains retained events before normal collection continues.
- A growing `outbox_pending` count means the backend, route, authentication, or response status needs attention.
- Preserve the SQLite database together with its `-wal` and `-shm` files when taking a live backup, or stop the collector first.
- Never edit/delete a queued row to fix an ID conflict without first preserving the payload and determining why immutable identity was violated.
