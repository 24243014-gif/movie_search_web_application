pipeline {
    agent any

    environment {
        OMDB_API_KEY   = '2ef8cf89'
        FLASK_ENV      = 'testing'
        PYTHONPATH     = "${WORKSPACE}"
        APP_NAME       = 'cinesearch-movie-app'
        APP_VERSION    = '1.0.0'
    }

    stages {

        // ─────────────────────────────────────────────────────
        // STAGE 1: CHECKOUT  (equivalent to git clone / svn checkout)
        // ─────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '========== STAGE 1: CHECKOUT =========='
                git branch: 'main',
                    url: 'https://github.com/24243014-gif/movie_search_web_application.git'
                echo 'Repository cloned successfully.'
            }
        }

        // ─────────────────────────────────────────────────────
        // STAGE 2: INSTALL DEPENDENCIES  (equivalent to mvn dependency:resolve)
        // ─────────────────────────────────────────────────────
        stage('Install Dependencies') {
            steps {
                echo '========== STAGE 2: INSTALL DEPENDENCIES =========='
                echo 'Python equivalent of: mvn dependency:resolve'
                bat 'pip install -r requirements.txt'
                bat 'pip install setuptools wheel'
                echo 'All dependencies installed successfully.'
            }
        }

        // ─────────────────────────────────────────────────────
        // STAGE 3: RUN TESTS  (equivalent to mvn test)
        // ─────────────────────────────────────────────────────
        stage('Run Tests') {
            steps {
                echo '========== STAGE 3: RUN TESTS =========='
                echo 'Python equivalent of: mvn test'
                bat 'python -m pytest test_app.py -v --tb=short'
                echo 'All tests passed.'
            }
        }

        // ─────────────────────────────────────────────────────
        // STAGE 4: PACKAGE  (equivalent to mvn package → produces .war/.jar)
        // ─────────────────────────────────────────────────────
        stage('Package') {
            steps {
                echo '========== STAGE 4: PACKAGE =========='
                echo 'Python equivalent of: mvn package (produces .war/.jar)'
                echo 'Building source distribution (.tar.gz) and ZIP artifact...'

                // Build source distribution — Python equivalent of WAR
                bat 'python setup.py sdist --formats=zip'

                // Also create a clean deployment ZIP (WAR-style archive)
                bat '''
                    mkdir build_output 2>nul || true
                    powershell -Command "Compress-Archive -Path app.py,requirements.txt,setup.py,templates,static -DestinationPath build_output\\cinesearch-movie-app-1.0.0.zip -Force"
                    echo Deployment package created: cinesearch-movie-app-1.0.0.zip
                '''

                echo 'Package stage complete!'
                echo 'Artifact: build_output/cinesearch-movie-app-1.0.0.zip'
                echo '(This .zip is the Python equivalent of a .war file)'
            }
        }

        // ─────────────────────────────────────────────────────
        // STAGE 5: VERIFY  (equivalent to mvn verify)
        // ─────────────────────────────────────────────────────
        stage('Verify') {
            steps {
                echo '========== STAGE 5: VERIFY =========='
                bat 'python -c "from app import app; print(\'[OK] App imports successfully\')"'
                bat 'dir dist'
                bat 'dir build_output'
                echo 'Verification complete. App is ready to deploy!'
            }
        }

    }

    post {
        success {
            echo '=========================================='
            echo ' BUILD SUCCEEDED!'
            echo ' Artifact: build_output/cinesearch-movie-app-1.0.0.zip'
            echo ' This is the Python equivalent of a .war file'
            echo '=========================================='

            // Archive the artifact so it appears in Jenkins build page
            archiveArtifacts artifacts: 'build_output/*.zip, dist/*.zip',
                             fingerprint: true,
                             allowEmptyArchive: true
        }
        failure {
            echo '=========================================='
            echo ' BUILD FAILED! Check the logs above.'
            echo '=========================================='
        }
        always {
            echo 'Pipeline finished.'
        }
    }
}
