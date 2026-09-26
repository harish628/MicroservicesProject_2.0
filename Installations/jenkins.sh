yum install java-21-amazon-corretto -y

sudo yum install wget -y

sudo wget -O /etc/yum.repos.d/jenkins.repo \
https://pkg.jenkins.io/redhat-stable/jenkins.repo

sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2026.key

sudo yum install jenkins -y

sudo systemctl enable jenkins
sudo systemctl start jenkins
