from flask import request, jsonify, g
from app import app
from config import LOGIN_SERVER
from functools import wraps
import requests
import json
import sys

def token_required(*neededRoles):
    def dec_token_required(f):
        @wraps(f)
        def decorator(*args, **kwargs):
            token = None
            try:
                if 'Authorization' in request.headers:
                    token = request.headers['Authorization'].split(" ")[1]
                if not token:
                    app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Missing authorization token", extra={
                        "client.ip": request.remote_addr,
                        "user.name": "Unknown",
                        "user.roles": "Unknown",
                        "http.request.method": request.method,
                        "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Missing authorization token",
                        "event.action": "ANY",
                        "event.reason": "Missing authorization token",
                        "event.outcome": "failure"
                    })
                    return jsonify({"message": "error", "reason":"Unauthenticated"}), 401

                r = requests.get(f"{LOGIN_SERVER}/roles", headers={"Authorization": f"Bearer {token}"})
                
                if r.status_code != 200:
                    app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Unknown error", extra={
                        "client.ip": request.remote_addr,
                        "user.name": "Unknown",
                        "user.roles": "Unknown",
                        "http.request.method": request.method,
                        "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Unknown error",
                        "event.action": "ANY",
                        "event.reason": "Unknown error",
                        "event.outcome": "failure"
                    })
                    return jsonify({"message": "error", "reason":"Unauthenticated"}), 401

                data = json.loads(r.text)
                if not "status" in data or not "roles" in data or not data["status"] == "success":
                    app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Unknown error", extra={
                        "client.ip": request.remote_addr,
                        "user.name": "Unknown",
                        "user.roles": "Unknown",
                        "http.request.method": request.method,
                        "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Unknown error",
                        "event.action": "ANY",
                        "event.reason": "Unknown error",
                        "event.outcome": "failure"
                    })
                    return jsonify({"message": "error", "reason":"Unauthenticated"}), 401

                g.roles = data.get("roles", [])
                g.user = data.get("user", "Unknown")
                
                matchedRoles = list(filter(lambda r: r in g.roles, neededRoles))

                if not len(matchedRoles):
                    app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Not sufficient privileges", extra={
                        "client.ip": request.remote_addr,
                        "user.name": g.user,
                        "user.roles": g.roles,
                        "http.request.method": request.method,
                        "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Not sufficient privileges",
                        "event.action": "ANY",
                        "event.reason": "Not sufficient privileges",
                        "event.outcome": "failure"
                    })    
                    return jsonify({"message": "error", "reason":"Unauthenticated - Not sufficient privilege"}), 401
            except Exception as e:
                print(f"Error while processing token authentication:\n{str(e)}", file=sys.stderr)
                app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Unknown error", extra={
                    "client.ip": request.remote_addr,
                    "user.name": "Unknown",
                    "user.roles": "Unknown",
                    "http.request.method": request.method,
                    "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Unknown error",
                    "event.action": "ANY",
                    "event.reason": "Unknown error",
                    "event.outcome": "failure"
                })
                return jsonify({"message": "error", "reason":"Unauthenticated"}), 401
            ret = f(*args, **kwargs)
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
                "event.action": "ANY",
                "event.outcome": "success"
            })
            return ret
        return decorator
    return dec_token_required