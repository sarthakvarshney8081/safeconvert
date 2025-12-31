from main import app
import json

routes = []
for route in app.routes:
    if hasattr(route, "methods"):
        routes.append(f"{route.path} {route.methods}")
    else:
        routes.append(f"{route.path}")

print("\n".join(sorted(routes)))
