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
        stage('Fast Build & Push') {
            steps {
                script {
                    sh 'echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin'
                    sh 'chmod +x build_and_push.sh'
                    // Fast build (single architecture) and push to Docker Hub
                    sh './build_and_push.sh --push'
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                // Use a generic SSH command instead of the potentially missing sshagent plugin
                withCredentials([sshUserPrivateKey(credentialsId: 'deploy-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh """
                        ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no sarthak@${DEPLOY_SERVER_IP} '
                            cd "/Users/sarthakvarshney/Docker Projects/nodejs-app/nodejs-app/pizza" && \
                            git pull origin main && \
                            docker compose pull && \
                            docker compose up -d
                        '
                    """
                }
            }
        }

        stage('Full Multi-platform Push') {
            steps {
                // This runs after deployment to ensure high-availability images are ready
                sh './build_and_push.sh --full --push'
            }
        }
    }

    post {
        always {
            sh 'docker logout'
            // Cleanup Jenkins VM resources using the specific cleanup-only flag
            sh './build_and_push.sh --cleanup-only'
        }
    }
}
