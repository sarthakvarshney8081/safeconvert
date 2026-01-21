from fastapi import APIRouter, HTTPException, Form
from pydantic import BaseModel
from typing import Optional
import feedparser
import requests
import json

router = APIRouter()

class RSSValidationResponse(BaseModel):
    valid: bool
    version: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    entries_count: int = 0
    errors: list[str] = []
    warnings: list[str] = []

@router.post("/rss-validate", response_model=RSSValidationResponse)
async def validate_rss(
    url: Optional[str] = Form(None),
    content: Optional[str] = Form(None)
):
    rss_content = content
    
    if url:
        try:
            # Add User-Agent to avoid 403s from some sites
            response = requests.get(url, headers={'User-Agent': 'SafeConverts-RSS-Validator/1.0'}, timeout=10)
            response.raise_for_status()
            rss_content = response.content
        except requests.RequestException as e:
             return RSSValidationResponse(
                valid=False,
                errors=[f"Failed to fetch URL: {str(e)}"]
            )
    
    if not rss_content:
        return RSSValidationResponse(
            valid=False,
            errors=["No content provided. Please provide a URL or XML content."]
        )

    # Parse the feed
    feed = feedparser.parse(rss_content)
    
    errors = []
    if feed.bozo:
        # bozo_exception might not be serializable, get string representation
        errors.append(f"Parsing Error: {str(feed.bozo_exception)}")

    # Check for feed version
    version = feed.version if 'version' in feed else "Unknown"
    
    # Check if it has entries or basic title to be considered somewhat valid
    has_title = 'title' in feed.feed
    has_entries = len(feed.entries) > 0
    
    is_valid = not feed.bozo and (has_title or has_entries)

    return RSSValidationResponse(
        valid=is_valid,
        version=version,
        title=feed.feed.get('title', 'N/A'),
        description=feed.feed.get('description', 'N/A'),
        entries_count=len(feed.entries),
        errors=errors
    )
