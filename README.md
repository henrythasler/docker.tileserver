# docker.tileserver
tileserver based on mapnik 3

# how to build
sudo docker build -t="img-tileserver:0.1" .

# how to run
* sudo docker run -ti --rm img-tileserver:0.1 /sbin/my_init -- bash -l

# how to git
git clone https://github.com/henrythasler/docker.tileserver.git
cd docker.tileserver
git remote add tileserver https://github.com/henrythasler/docker.tileserver
// do something
git add .
git commit -a
git push tileserver master

# references
https://github.com/der-stefan/OpenTopoMap/blob/master/mapnik/HOWTO_Server_16.04
https://www.linuxbabe.com/linux-server/openstreetmap-tile-server-ubuntu-16-04
https://github.com/MapFig/opentileserver
https://docs.docker.com/engine/userguide/eng-image/dockerfile_best-practices/