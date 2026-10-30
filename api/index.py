import sys
from pathlib import Path

# Add project root directory to sys.path so app, rules, and scripts are accessible
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.main import app as fastapi_app


class VercelPathFixMiddleware:
    """Restores the original incoming request path from x-matched-path header
    when Vercel internal rewrites rewrite the path to /api/index.py.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") in ("http", "websocket"):
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
