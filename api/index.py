import sys
import urllib.parse
from pathlib import Path

# Add project root directory to sys.path so app, rules, and scripts are accessible
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.main import app as fastapi_app


class VercelPathFixMiddleware:
    """Restores the original incoming request path from query param or header
    when Vercel internal rewrites rewrite the destination to /api/index.py.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") in ("http", "websocket"):
            qs_bytes = scope.get("query_string", b"")
            if qs_bytes:
                qs_str = qs_bytes.decode("latin1", "replace")
                params = urllib.parse.parse_qs(qs_str, keep_blank_values=True)
                if "_path" in params:
                    extracted_path = params.pop("_path")[0]
                    if not extracted_path.startswith("/"):
                        extracted_path = "/" + extracted_path
                    scope["path"] = extracted_path
                    scope["raw_path"] = extracted_path.encode("latin1")
                    clean_items = [(k, v) for k, vals in params.items() for v in vals]
                    scope["query_string"] = urllib.parse.urlencode(clean_items).encode("latin1")
            else:
                headers = dict(scope.get("headers", []))
                matched_path = headers.get(b"x-matched-path")
                if matched_path:
                    decoded = matched_path.decode("latin1", "replace")
                    if "?" in decoded:
                        decoded = decoded.split("?", 1)[0]
                    scope["path"] = decoded
                    scope["raw_path"] = decoded.encode("latin1")

        await self.app(scope, receive, send)


app = VercelPathFixMiddleware(fastapi_app)
