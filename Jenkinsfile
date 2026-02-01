pipeline {
    agent any

    environment {
        // defined in Jenkins Credentials
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
        // We will SSH using key authentication
        DEPLOY_SERVER_USER = 'root' // or your specific user
        DEPLOY_SERVER_IP = '192.168.10.132' // Replace with your actual Production IP if different
    }

    stages {
        stage('Build & Push') {
            steps {
                script {
                    // Login to Docker Hub
                    sh 'echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin'
                    
                    // Make script executable and run it
                    sh 'chmod +x build_and_push.sh'
                    sh './build_and_push.sh'
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                sshagent(['deploy-ssh-key']) {
                    // connect and pull updates
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_SERVER_USER}@${DEPLOY_SERVER_IP} '
                            cd "/Users/sarthakvarshney/Docker Projects/nodejs-app/nodejs-app/pizza" && \
                            git pull origin main && \
                            docker compose pull && \
                            docker compose up -d
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            // Logout
            sh 'docker logout'
        }
    }
}
