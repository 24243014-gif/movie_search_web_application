from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)

OMDB_API_KEY = "2ef8cf89"
OMDB_BASE_URL = "http://www.omdbapi.com/"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/search")
def search_movies():
    query = request.args.get("q", "").strip()
    page = request.args.get("page", 1)
    year = request.args.get("year", "")
    media_type = request.args.get("type", "")

    if not query:
        return jsonify({"error": "Search query is required"}), 400

    params = {
        "apikey": OMDB_API_KEY,
        "s": query,
        "page": page,
    }

    if year:
        params["y"] = year
    if media_type:
        params["type"] = media_type

    try:
        response = requests.get(OMDB_BASE_URL, params=params, timeout=10)
        data = response.json()

        if data.get("Response") == "True":
            return jsonify({
                "success": True,
                "results": data.get("Search", []),
                "total": int(data.get("totalResults", 0)),
                "page": int(page)
            })
        else:
            return jsonify({
                "success": False,
                "error": data.get("Error", "No results found")
            })
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to OMDB: {str(e)}"}), 500


@app.route("/api/movie/<imdb_id>")
def get_movie_details(imdb_id):
    params = {
        "apikey": OMDB_API_KEY,
        "i": imdb_id,
        "plot": "full"
    }

    try:
        response = requests.get(OMDB_BASE_URL, params=params, timeout=10)
        data = response.json()

        if data.get("Response") == "True":
            return jsonify({"success": True, "movie": data})
        else:
            return jsonify({"success": False, "error": data.get("Error", "Movie not found")})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to OMDB: {str(e)}"}), 500


@app.route("/api/trending")
def get_trending():
    """Return a curated list of popular movies to show on landing page"""
    popular_ids = [
        "tt0111161",  # The Shawshank Redemption
        "tt0068646",  # The Godfather
        "tt0468569",  # The Dark Knight
        "tt0050083",  # 12 Angry Men
        "tt0108052",  # Schindler's List
        "tt0167260",  # Return of the King
        "tt0110912",  # Pulp Fiction
        "tt0060196",  # The Good, the Bad and the Ugly
    ]

    movies = []
    for imdb_id in popular_ids:
        try:
            params = {"apikey": OMDB_API_KEY, "i": imdb_id}
            response = requests.get(OMDB_BASE_URL, params=params, timeout=10)
            data = response.json()
            if data.get("Response") == "True":
                movies.append(data)
        except:
            pass

    return jsonify({"success": True, "movies": movies})


if __name__ == "__main__":
    print("CineSearch is running at http://127.0.0.1:5000")
    app.run(debug=True, host="127.0.0.1", port=5000)
