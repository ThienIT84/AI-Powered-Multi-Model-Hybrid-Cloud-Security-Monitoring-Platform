from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import TextIO
from urllib.error import URLError
from urllib.request import Request, urlopen

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.replay.zeek import ReplayEventBuilder, normalize_http_row, parse_zeek_line  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Tail Zeek http.log and POST new HTTP events to the backend API.")
    parser.add_argument("--http-log", required=True, help="Path to live Zeek http.log, or '-' to read from stdin.")
    parser.add_argument("--api-url", default="http://localhost:8000/api/events")
    parser.add_argument("--poll-interval", type=float, default=0.5)
    parser.add_argument("--limit", type=int, default=0, help="Stop after N emitted events; 0 means no limit.")
    parser.add_argument("--from-start", action="store_true", help="Read existing rows before following new rows.")
    parser.add_argument("--dry-run", action="store_true", help="Print events instead of POSTing them.")
    args = parser.parse_args()

    tail_http_log(
        args.http_log,
        api_url=args.api_url,
        poll_interval=args.poll_interval,
        limit=args.limit,
        from_start=args.from_start,
        dry_run=args.dry_run,
    )


def tail_http_log(
    http_log: str,
    *,
    api_url: str,
    poll_interval: float,
    limit: int,
    from_start: bool,
    dry_run: bool,
) -> None:
    input_label = "stdin" if http_log == "-" else str(http_log)
    fields = None if http_log == "-" else _load_fields(Path(http_log))
    emitted = 0
    print(
        json.dumps(
            {
                "status": "tail_started",
                "http_log": input_label,
                "api_url": api_url,
                "from_start": from_start,
                "dry_run": dry_run,
            },
            sort_keys=True,
        ),
        flush=True,
    )
    if http_log == "-":
        emitted = _consume_lines(
            sys.stdin,
            fields=fields,
            api_url=api_url,
            limit=limit,
            dry_run=dry_run,
            wait_for_more=False,
            poll_interval=poll_interval,
        )
    else:
        with Path(http_log).open("r", encoding="utf-8") as handle:
            if not from_start:
                handle.seek(0, 2)
            emitted = _consume_lines(
                handle,
                fields=fields,
                api_url=api_url,
                limit=limit,
                dry_run=dry_run,
                wait_for_more=True,
                poll_interval=poll_interval,
            )
    print(json.dumps({"status": "tail_stopped", "emitted": emitted}, sort_keys=True), flush=True)


def _consume_lines(
    handle: TextIO,
    *,
    fields: list[str] | None,
    api_url: str,
    limit: int,
    dry_run: bool,
    wait_for_more: bool,
    poll_interval: float,
) -> int:
    emitted = 0
    while True:
        raw_line = handle.readline()
        if not raw_line:
            if limit and emitted >= limit:
                break
            if wait_for_more:
                time.sleep(poll_interval)
                continue
            break
        row, fields = parse_zeek_line(raw_line, fields)
        if row is None:
            continue
        event = build_http_event(row, sequence=emitted + 1)
        if dry_run:
            print(json.dumps({"status": "dry_run_event", "event": event}, sort_keys=True), flush=True)
        else:
            post_event(api_url, event)
            print(
                json.dumps(
                    {
                        "status": "posted",
                        "event_id": event["event_id"],
                        "uri": event["evidence"]["http"]["uri"],
                    },
                    sort_keys=True,
                ),
                flush=True,
            )
        emitted += 1
        if limit and emitted >= limit:
            break
    return emitted


def build_http_event(row: dict, *, sequence: int) -> dict:
    http = normalize_http_row(row)
    uid = http.get("uid") or f"http-tail-{sequence}"
    return ReplayEventBuilder().build(str(uid), http=http)


def post_event(api_url: str, event: dict) -> None:
    payload = json.dumps(event).encode("utf-8")
    request = Request(api_url, data=payload, method="POST")
    request.add_header("Content-Type", "application/json")
    try:
        with urlopen(request, timeout=10) as response:  # noqa: S310 - local lab API endpoint.
            response.read()
    except URLError as exc:
        raise RuntimeError(f"Failed to POST event to {api_url}: {exc}") from exc


def _load_fields(http_log: Path) -> list[str] | None:
    fields: list[str] | None = None
    if not http_log.exists():
        raise FileNotFoundError(f"Zeek http.log does not exist: {http_log}")
    with http_log.open("r", encoding="utf-8") as handle:
        for line in handle:
            _, fields = parse_zeek_line(line, fields)
    return fields


if __name__ == "__main__":
    main()
