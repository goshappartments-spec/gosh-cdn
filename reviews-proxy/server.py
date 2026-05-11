"""
gosh.rent — Travelline Reviews Proxy
Хостится на Railway, проксирует и кэширует данные TL API для сайта.
"""
import os, json, time, threading, urllib.request, urllib.parse
from collections import defaultdict
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://gosh.rent", "https://www.gosh.rent", "*"])

TL_CLIENT_ID = os.environ["TL_CLIENT_ID"]
TL_CLIENT_SECRET = os.environ["TL_CLIENT_SECRET"]
PROPERTY_ID = os.environ.get("TL_PROPERTY_ID", "29563")
REFRESH_INTERVAL = int(os.environ.get("REFRESH_INTERVAL", 3600))  # 1 hour

SOURCES = {
    "1":"Booking.com","2":"TripAdvisor","3":"Hotels.com","4":"TopHotels","5":"Agoda",
    "6":"TL: Marketing","7":"101Hotels","8":"Trip.com","9":"Airbnb","10":"Facebook",
    "11":"HolidayCheck","12":"Google","13":"Flamp","14":"Visit.bg","15":"Tvil",
    "16":"Yandex","17":"Bronevik","18":"OneTwoTrip","19":"Ostrovok","20":"2GIS",
    "21":"Traveloka","22":"MakeMyTrip","23":"Goibibo","24":"Yatra","25":"Sutochno",
    "26":"Expedia","27":"TL: Guest Mgmt","28":"YandexTravel","29":"Ozon Travel"
}

CACHE = {"stats": None, "reviews": [], "updatedAt": None, "loading": False}


def get_token():
    req = urllib.request.Request(
        "https://partner.tlintegration.com/auth/token",
        data=urllib.parse.urlencode({
            "grant_type": "client_credentials",
            "client_id": TL_CLIENT_ID,
            "client_secret": TL_CLIENT_SECRET,
        }).encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    return json.loads(urllib.request.urlopen(req, timeout=15).read())["access_token"]


def fetch_all_reviews(token):
    """Walk all pages via nextPageToken."""
    reviews = []
    next_token = ""
    pages = 0
    base = f"https://partner.tlintegration.com/api/reputation-public-reviews/v1/properties/{PROPERTY_ID}/reviews"
    while True:
        url = base + (f"?nextPageToken={urllib.parse.quote(next_token)}" if next_token else "")
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        data = json.loads(urllib.request.urlopen(req, timeout=20).read())
        reviews.extend(data.get("reviews", []))
        pages += 1
        if not data.get("hasNextPage") or pages > 500:
            break
        next_token = data.get("nextPageToken", "")
        time.sleep(0.4)  # respect 3 req/sec limit
    return reviews


def refresh():
    if CACHE["loading"]:
        return
    CACHE["loading"] = True
    try:
        print(f"[{time.strftime('%H:%M:%S')}] Refreshing TL reviews...")
        token = get_token()
        reviews = fetch_all_reviews(token)

        agg = defaultdict(lambda: {"sum": 0, "n": 0, "latest": None})
        for r in reviews:
            sid = r["sourceId"]
            agg[sid]["sum"] += r["rating"]
            agg[sid]["n"] += 1
            if not agg[sid]["latest"] or r["publishDate"] > agg[sid]["latest"]:
                agg[sid]["latest"] = r["publishDate"]

        total_sum = sum(a["sum"] for a in agg.values())
        total_n = sum(a["n"] for a in agg.values()) or 1

        stats = {
            "total": {
                "averageRating10": round(total_sum / total_n, 2),
                "averageRating5": round(total_sum / total_n / 2, 2),
                "reviewsCount": total_n,
            },
            "bySource": {
                SOURCES.get(sid, f"id{sid}"): {
                    "avg10": round(a["sum"] / a["n"], 2),
                    "avg5": round(a["sum"] / a["n"] / 2, 2),
                    "count": a["n"],
                    "latest": a["latest"][:10] if a["latest"] else None,
                }
                for sid, a in agg.items()
            },
            "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }

        # latest 12 5★ reviews for carousel
        latest_top = sorted(
            [r for r in reviews if r["rating"] >= 9 and r.get("originalText")],
            key=lambda x: x["publishDate"],
            reverse=True,
        )[:12]

        CACHE["stats"] = stats
        CACHE["reviews"] = [
            {
                "id": r["id"],
                "author": r["authorName"],
                "date": r["publishDate"][:10],
                "rating10": r["rating"],
                "rating5": round(r["rating"] / 2, 1),
                "text": r["originalText"],
                "source": SOURCES.get(r["sourceId"], r["sourceId"]),
                "reply": r.get("replyText") or None,
            }
            for r in latest_top
        ]
        CACHE["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        print(f"  ✓ {total_n} reviews aggregated across {len(agg)} sources")
    except Exception as e:
        print(f"  ✗ Refresh error: {e}")
    finally:
        CACHE["loading"] = False


def background_refresher():
    while True:
        if not CACHE["stats"]:
            refresh()
        time.sleep(REFRESH_INTERVAL)
        refresh()


# Start background thread
threading.Thread(target=background_refresher, daemon=True).start()


@app.route("/")
def index():
    return jsonify({
        "service": "gosh.rent reviews proxy",
        "cache_updated": CACHE["updatedAt"],
        "endpoints": ["/api/stats", "/api/reviews"]
    })


@app.route("/api/stats")
def api_stats():
    if not CACHE["stats"]:
        return jsonify({"status": "warming up, try again in 60 sec"}), 503
    return jsonify({**CACHE["stats"], "cachedAt": CACHE["updatedAt"]})


@app.route("/api/reviews")
def api_reviews():
    limit = min(int(request.args.get("limit", 12)), 50)
    return jsonify({"reviews": CACHE["reviews"][:limit], "cachedAt": CACHE["updatedAt"]})


@app.route("/api/refresh", methods=["POST"])
def api_refresh():
    """Manual refresh trigger (protect with secret in prod)."""
    secret = request.headers.get("X-Refresh-Secret")
    if secret != os.environ.get("REFRESH_SECRET", "change-me"):
        return jsonify({"error": "forbidden"}), 403
    threading.Thread(target=refresh, daemon=True).start()
    return jsonify({"status": "refreshing"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
