pipeline {
    agent {
      kubernetes {
        defaultContainer 'node'
        yaml """
  kind: Pod
  spec:
    containers:
    - name: node
      image: node:15.7.0
      command:
      - cat
      tty: true
    - name: kaniko
      image: gcr.io/kaniko-project/executor:v1.5.1-debug
      command:
        - /busybox/cat
      tty: true
      securityContext:
        allowPrivilegeEscalation: false
      volumeMounts:
        - name: jenkins-docker-cfg
          mountPath: /kaniko/.docker
    volumes:
      - name: jenkins-docker-cfg
        projected:
          sources:
            - secret:
                name: gitlab-polkabtc-ui-registry
                items:
                  - key: .dockerconfigjson
                    path: config.json
  """
      }
    }
    environment {
        CI = 'true'
        DISCORD_WEBHOOK_URL = credentials('discord_webhook_url')
    }
    options {
        ansiColor('xterm')
    }
    stages {
        stage('Prepare') {
            steps {
              sh script: 'apt-get update && apt-get install -y libusb-1.0-0-dev libudev-dev', label: 'Install linux dependencies'
              sh 'ln -s .env.${BRANCH_NAME:-dev} .env'
              sh 'yarn install'
              sh 'yarn lint'
            }
        }
        stage('Test') {
            steps {
                sh 'yarn test'
            }
        }
        stage('Build') {
          steps {
            sh 'yarn build --production'
            stash(name: 'yarn_build', includes: 'DockerfileProd, nginx.conf, build/')
          }
        }
        stage('Build docker image') {
            environment {
                PATH        = "/busybox:$PATH"
                REGISTRY    = 'registry.gitlab.com' // Configure your own registry
                REPOSITORY  = 'interlay'
                IMAGE       = 'polkabtc-ui'
            }
            steps {
                container(name: 'kaniko', shell: '/busybox/sh') {
                    dir('unstash') {
                        unstash("yarn_build")
                        sh '''#!/busybox/sh
                        GIT_BRANCH_SLUG=$(echo $BRANCH_NAME | sed -e 's/\\//-/g')
                        /kaniko/executor -f `pwd`/DockerfileProd -c `pwd` \
                            --destination=${REGISTRY}/${REPOSITORY}/${IMAGE}:${GIT_BRANCH_SLUG} \
                            --destination=${REGISTRY}/${REPOSITORY}/${IMAGE}:${GIT_BRANCH_SLUG}-${GIT_COMMIT:0:6}-$(date +%s)
                        '''
                    }
                }
            }
        }
        stage('Create GitHub release') {
            when {
                anyOf {
                    tag '*'
                }
            }
            steps {
                sh '''
                    wget -q -O - https://github.com/git-chglog/git-chglog/releases/download/v0.10.0/git-chglog_0.10.0_linux_amd64.tar.gz | tar xzf -
                    #export PREV_TAG=$(git describe --abbrev=0 --tags `git rev-list --tags --skip=1 --max-count=1`)
                    #export TAG_NAME=$(git describe --abbrev=0 --tags `git rev-list --tags --skip=0 --max-count=1`)
                    ./git-chglog --output CHANGELOG.md $TAG_NAME
                '''
                archiveArtifacts 'CHANGELOG.md'
            }
        }
    }
    post {
      always {
        discordSend description: "Jenkins Pipeline Build", footer: "Footer Text", link: env.BUILD_URL, result: currentBuild.currentResult, title: JOB_NAME, webhookURL: env.DISCORD_WEBHOOK_URL
      }
    }
}
