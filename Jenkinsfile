pipeline {
    agent any

    environment {
        OMDB_API_KEY = '2ef8cf89'
        FLASK_ENV = 'testing'
        PYTHONPATH = "${WORKSPACE}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Cloning repository from GitHub...'
                git branch: 'main',
                    url: 'https://github.com/24243014-gif/movie_search_web_application.git'
            }
        }

        stage('Setup Python Environment') {
            steps {
                echo 'Installing Python dependencies...'
                bat 'pip install -r requirements.txt'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running pytest test suite...'
                bat 'python -m pytest test_app.py -v --tb=short'
            }
        }

        stage('Start Application') {
            steps {
                echo 'Verifying application starts correctly...'
                bat 'python -c "from app import app; print(\'App import OK\')"'
            }
        }

    }

    post {
        success {
            echo 'Build SUCCEEDED! CineSearch app is ready.'
        }
        failure {
            echo 'Build FAILED! Check the logs above.'
        }
    }
}
