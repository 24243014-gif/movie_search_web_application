from setuptools import setup, find_packages

# setup.py is the Python equivalent of Maven's pom.xml
# It defines the project metadata and packaging configuration

setup(
    name="cinesearch-movie-app",
    version="1.0.0",
    description="CineSearch - Movie Search Web Application powered by OMDB API",
    author="Student",
    author_email="student@cinesearch.com",
    url="https://github.com/24243014-gif/movie_search_web_application",
    packages=find_packages(),
    include_package_data=True,
    package_data={
        "": [
            "templates/*.html",
            "static/css/*.css",
            "static/js/*.js",
        ]
    },
    install_requires=[
        "flask>=3.0.3",
        "requests>=2.32.3",
    ],
    extras_require={
        "test": [
            "pytest>=8.3.3",
            "pytest-flask>=1.3.0",
        ]
    },
    python_requires=">=3.8",
    classifiers=[
        "Framework :: Flask",
        "Programming Language :: Python :: 3",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
    ],
    entry_points={
        "console_scripts": [
            "cinesearch=app:app",
        ]
    },
)
