sudo rm -rf /usr/local/lib/docker/cli-plugins/docker-buildx
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -fL \
https://github.com/docker/buildx/releases/download/v0.17.1/buildx-v0.17.1.linux-amd64 \
-o /usr/local/lib/docker/cli-plugins/docker-buildx
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx
docker buildx version

systemctl restart jenkins
sudo -u jenkins docker buildx version