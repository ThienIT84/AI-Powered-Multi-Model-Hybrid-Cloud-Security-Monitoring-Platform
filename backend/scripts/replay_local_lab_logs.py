from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from urllib.request import Request, urlopen

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.replay import AI2AFlowFeatureExtractor, ZeekConnParser, ZeekHttpParser, ZeekUidCorrelator  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Replay local Zeek conn/http logs into the backend event API.")
    parser.add_argument("--conn-log", type=Path, help="Path to Zeek conn.log in JSON-lines or #fields TSV format.")
    parser.add_argument("--http-log", type=Path, help="Path to Zeek http.log in JSON-lines or #fields TSV format.")
    parser.add_argument("--api-url", default="http://localhost:8000/api/events")
    parser.add_argument("--limit", type=int, default=0, help="Maximum events to emit; 0 means no limit.")
    parser.add_argument("--dry-run", action="store_true", help="Parse/correlate and print summary without POSTing events.")
    args = parser.parse_args()

    flows = ZeekConnParser().parse_flows(args.conn_log) if args.conn_log else []
    if flows:
        flows = AI2AFlowFeatureExtractor().enrich_flows(flows)
    http_rows = ZeekHttpParser().parse_http(args.http_log) if args.http_log else []
    events = ZeekUidCorrelator().correlate(flows, http_rows)
    if args.limit > 0:
        events = events[: args.limit]

    posted = 0
    if not args.dry_run:
        for event in events:
            post_event(args.api_url, event)
            posted += 1

    summary = {
        "dry_run": args.dry_run,
        "conn_rows": len(flows),
        "ai2a_feature_enriched_flows": sum(1 for flow in flows if "ai2a_features" in flow),
        "http_rows": len(http_rows),
        "events": len(events),
        "combined_events": sum(1 for event in events if event["event_type"] == "combined"),
        "flow_only_events": sum(1 for event in events if event["event_type"] == "network_flow"),
        "http_only_events": sum(1 for event in events if event["event_type"] == "http"),
        "posted": posted,
        "api_url": args.api_url,
    }
    print(json.dumps(summary, indent=2, sort_keys=True))


def post_event(api_url: str, event: dict) -> None:
    payload = json.dumps(event).encode("utf-8")
    request = Request(api_url, data=payload, method="POST")
    request.add_header("Content-Type", "application/json")
    with urlopen(request, timeout=10) as response:  # noqa: S310 - local lab API endpoint.
        response.read()


if __name__ == "__main__":
    main()
