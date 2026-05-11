"""gosh.rent — Travelline Reviews Proxy v2 (verbose logging)"""
import os, sys, json, time, threading, urllib.request, urllib.parse, traceback
from collections import defaultdict
from flask import Flask, jsonify, request
from flask_cors import CORS

def log(*a):
    msg = "[" + time.strftime("%H:%M:%S") + "] " + " ".join(str(x) for x in a)
    print(msg, flush=True); sys.stdout.flush()

app = Flask(__name__)
CORS(app, origins=["*"])

TL_CLIENT_ID = os.environ.get("TL_CLIENT_ID", "")
TL_CLIENT_SECRET = os.environ.get("TL_CLIENT_SECRET", "")
PROPERTY_ID = os.environ.get("TL_PROPERTY_ID", "29563")
REFRESH_INTERVAL = int(os.environ.get("REFRESH_INTERVAL", 3600))

SOURCES = {"1":"Booking.com","2":"TripAdvisor","3":"Hotels.com","4":"TopHotels","5":"Agoda",
"6":"TL: Marketing","7":"101Hotels","8":"Trip.com","9":"Airbnb","10":"Facebook",
"11":"HolidayCheck","12":"Google","13":"Flamp","14":"Visit.bg","15":"Tvil",
"16":"Yandex","17":"Bronevik","18":"OneTwoTrip","19":"Ostrovok","20":"2GIS",
"21":"Traveloka","22":"MakeMyTrip","23":"Goibibo","24":"Yatra","25":"Sutochno",
"26":"Expedia","27":"TL: Guest Mgmt","28":"YandexTravel","29":"Ozon Travel"}

CACHE = {"stats": None, "reviews": [], "updatedAt": None, "lastError": None, "progress": "idle"}

def get_token():
    log("  get_token: POST /auth/token")
    req = urllib.request.Request(
        "https://partner.tlintegration.com/auth/token",
        data=urllib.parse.urlencode({
            "grant_type":"client_credentials",
            "client_id":TL_CLIENT_ID,
            "client_secret":TL_CLIENT_SECRET,
        }).encode(),
        headers={"Content-Type":"application/x-www-form-urlencoded"})
    resp = urllib.request.urlopen(req, timeout=20).read()
    token = json.loads(resp)["access_token"]
    log(f"  get_token: OK, token_len={len(token)}")
    return token

def fetch_all_reviews(token):
    reviews = []
    next_token = ""
    pages = 0
    base = f"https://partner.tlintegration.com/api/reputation-public-reviews/v1/properties/{PROPERTY_ID}/reviews"
    log(f"  fetch_all: starting pagination from {base}")
    while True:
        url = base + (f"?nextPageToken={urllib.parse.quote(next_token)}" if next_token else "")
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        try:
            data = json.loads(urllib.request.urlopen(req, timeout=20).read())
        except Exception as e:
            log(f"  fetch_all: page {pages+1} FAILED: {type(e).__name__}: {e}")
            raise
        rs = data.get("reviews", [])
        reviews.extend(rs)
        pages += 1
        if pages % 20 == 0:
            log(f"  fetch_all: progress {pages} pages, {len(reviews)} reviews")
            CACHE["progress"] = f"{pages} pages, {len(reviews)} reviews"
        if not data.get("hasNextPage") or pages > 500:
            log(f"  fetch_all: DONE {pages} pages, {len(reviews)} total reviews")
            break
        next_token = data.get("nextPageToken","")
        time.sleep(0.4)
    return reviews

def refresh():
    log("=== REFRESH START ===")
    CACHE["progress"] = "starting"
    try:
        token = get_token()
        CACHE["progress"] = "fetching reviews"
        reviews = fetch_all_reviews(token)
        log(f"  aggregating {len(reviews)} reviews...")
        agg = defaultdict(lambda: {"sum":0,"n":0,"latest":None})
        for r in reviews:
            sid = r["sourceId"]
            agg[sid]["sum"] += r["rating"]
            agg[sid]["n"] += 1
            if not agg[sid]["latest"] or r["publishDate"] > agg[sid]["latest"]:
                agg[sid]["latest"] = r["publishDate"]
        total_sum = sum(a["sum"] for a in agg.values())
        total_n = sum(a["n"] for a in agg.values()) or 1
        stats = {
            "total": {"averageRating10": round(total_sum/total_n,2), "averageRating5": round(total_sum/total_n/2,2), "reviewsCount": total_n},
            "bySource": {SOURCES.get(sid,f"id{sid}"): {"avg10":round(a["sum"]/a["n"],2),"avg5":round(a["sum"]/a["n"]/2,2),"count":a["n"],"latest":a["latest"][:10] if a["latest"] else None} for sid,a in agg.items()},
            "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        latest_top = sorted([r for r in reviews if r["rating"]>=9 and r.get("originalText")], key=lambda x:x["publishDate"], reverse=True)[:12]
        CACHE["stats"] = stats
        CACHE["reviews"] = [{"id":r["id"],"author":r["authorName"],"date":r["publishDate"][:10],"rating10":r["rating"],"rating5":round(r["rating"]/2,1),"text":r["originalText"],"source":SOURCES.get(r["sourceId"],r["sourceId"])} for r in latest_top]
        CACHE["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        CACHE["progress"] = "complete"
        CACHE["lastError"] = None
        log(f"  ✓ REFRESH DONE: {total_n} reviews, {len(agg)} sources, avg={total_sum/total_n:.2f}")
    except Exception as e:
        tb = traceback.format_exc()
        log(f"  ✗ REFRESH FAILED: {type(e).__name__}: {e}")
        for line in tb.split("\n"): log("    " + line)
        CACHE["lastError"] = f"{type(e).__name__}: {e}"
        CACHE["progress"] = "failed"

def bg_refresher():
    while True:
        if not CACHE["stats"]:
            refresh()
        time.sleep(REFRESH_INTERVAL)
        refresh()

threading.Thread(target=bg_refresher, daemon=True).start()
log("Background refresher started")

@app.route("/")
def index():
    return jsonify({"service":"gosh.rent reviews proxy","cache_updated":CACHE["updatedAt"],"progress":CACHE["progress"],"lastError":CACHE["lastError"],"endpoints":["/api/stats","/api/reviews","/api/debug"]})

@app.route("/api/stats")
def api_stats():
    if not CACHE["stats"]:
        return jsonify({"status":"warming up","progress":CACHE["progress"],"lastError":CACHE["lastError"]}), 503
    return jsonify({**CACHE["stats"],"cachedAt":CACHE["updatedAt"]})

@app.route("/api/reviews")
def api_reviews():
    limit = min(int(request.args.get("limit",12)),50)
    return jsonify({"reviews":CACHE["reviews"][:limit],"cachedAt":CACHE["updatedAt"]})

@app.route("/api/debug")
def api_debug():
    return jsonify({"progress":CACHE["progress"],"updatedAt":CACHE["updatedAt"],"lastError":CACHE["lastError"],"has_stats":CACHE["stats"] is not None,"reviews_count":len(CACHE["reviews"]),"env_ok":bool(TL_CLIENT_ID and TL_CLIENT_SECRET)})

@app.route("/api/refresh", methods=["POST"])
def api_refresh():
    if request.headers.get("X-Refresh-Secret") != os.environ.get("REFRESH_SECRET","change-me"):
        return jsonify({"error":"forbidden"}), 403
    threading.Thread(target=refresh, daemon=True).start()
    return jsonify({"status":"refreshing"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    log(f"Starting Flask on 0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, threaded=True)
