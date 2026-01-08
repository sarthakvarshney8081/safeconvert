import logging
import os
from datetime import datetime

# Ensure logs directory exists
LOG_DIR = "logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Internal-only audit log file (Not exposed via API)
AUDIT_LOG_FILE = os.path.join(LOG_DIR, "audit.log")

# Create a dedicated audit logger
audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)

# File handler for audit logs
file_handler = logging.FileHandler(AUDIT_LOG_FILE)
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
file_handler.setFormatter(formatter)

# Prevent audit logs from propagating to the root logger (and showing up in terminal twice)
audit_logger.propagate = False
audit_logger.addHandler(file_handler)

def log_audit_event(event_type: str, file_id: str, detail: str = ""):
    """
    Logs a structured audit event.
    """
    message = f"[{event_type}] FileID: {file_id} | {detail}"
    audit_logger.info(message)
