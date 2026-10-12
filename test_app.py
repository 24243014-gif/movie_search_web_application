import pytest
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app

# ===== FIXTURES =====
@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# ===== TESTS =====

def test_home_page(client):
    """Test that home page loads successfully"""
    response = client.get('/')
    assert response.status_code == 200

def test_search_no_query(client):
    """Test search with no query returns 400"""
    response = client.get('/api/search')
    assert response.status_code == 400

def test_search_with_query(client):
    """Test search with a valid query"""
    response = client.get('/api/search?q=batman')
    assert response.status_code == 200
    data = response.get_json()
    assert 'success' in data

def test_movie_details(client):
    """Test movie details endpoint"""
    response = client.get('/api/movie/tt0468569')  # The Dark Knight
    assert response.status_code == 200
    data = response.get_json()
    assert 'success' in data

def test_trending(client):
    """Test trending endpoint"""
    response = client.get('/api/trending')
    assert response.status_code == 200
    data = response.get_json()
    assert 'success' in data
