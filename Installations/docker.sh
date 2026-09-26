sudo yum update -y
sudo yum install -y docker

sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

docker --version
sudo -u jenkins docker ps