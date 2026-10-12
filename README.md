# 🎬 CineSearch — Movie Search Web Application

A beautiful, feature-rich Movie Search web application built with **Python Flask** (backend) and **HTML/CSS/JavaScript** (frontend), powered by the **OMDB API**.

![CineSearch Banner](https://img.shields.io/badge/Python-Flask-blue?style=for-the-badge&logo=flask)
![OMDB API](https://img.shields.io/badge/OMDB-API-orange?style=for-the-badge)
![HTML CSS JS](https://img.shields.io/badge/HTML%20CSS%20JS-Frontend-yellow?style=for-the-badge)

---

## ✨ Features

- 🔍 **Smart Search** — Live debounce search with results from OMDB
- 🎛️ **Filters** — Filter by type (Movie / Series / Episode) & year
- 📄 **Pagination** — Smart page navigation with 10 results per page
- 🎭 **Movie Detail Modal** — Full details: plot, cast, ratings, awards, box office
- ❤️ **Watchlist** — Save/remove favorites (persisted in localStorage)
- 🌙 **Dark / Light Mode** — Toggle with preference remembered
- ⊞ **Grid / List View** — Switch between card and list layout
- 🔥 **Trending Section** — 8 must-watch classics on homepage
- ⌨️ **Keyboard Shortcuts** — `Ctrl+K` to focus search, `Esc` to close modals
- 📱 **Fully Responsive** — Works on mobile, tablet & desktop

---

## 🗂️ Project Structure

```
web_application/
├── app.py              ← Flask backend (API routes)
├── requirements.txt    ← Python dependencies
├── .gitignore
├── README.md
├── templates/
│   └── index.html      ← Main HTML template
└── static/
    ├── css/
    │   └── style.css   ← Full design system with dark/light mode
    └── js/
        └── main.js     ← All frontend interactivity
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/24243014-gif/movie_search_web_application.git
cd movie_search_web_application
```

### 2. Install dependencies
```bash
pip install flask requests
```

### 3. Set your OMDB API key
Open `app.py` and replace the API key:
```python
OMDB_API_KEY = "your_api_key_here"
```
Get a free key at [omdbapi.com](https://www.omdbapi.com/apikey.aspx)

### 4. Run the app
```bash
python app.py
```

### 5. Open in browser
Visit **http://127.0.0.1:5000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main page |
| GET | `/api/search?q=batman&page=1&type=movie&year=2022` | Search movies |
| GET | `/api/movie/<imdb_id>` | Get full movie details |
| GET | `/api/trending` | Get must-watch classics |

---

## 🛠️ Tech Stack

- **Backend**: Python 3, Flask
- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+)
- **API**: [OMDB API](https://www.omdbapi.com/)
- **Fonts**: Google Fonts (Outfit)

---

## 📄 License

MIT License — feel free to use and modify!
