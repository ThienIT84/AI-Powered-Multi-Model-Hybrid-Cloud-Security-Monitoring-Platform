from __future__ import annotations

import json
from urllib.request import Request, urlopen


def main() -> None:
    request = Request("http://localhost:8000/api/replay/demo", data=b"{}", method="POST")
    request.add_header("Content-Type", "application/json")
    with urlopen(request, timeout=10) as response:  # noqa: S310 - local demo endpoint.
        print(json.dumps(json.loads(response.read().decode("utf-8")), indent=2))


if __name__ == "__main__":
    main()

