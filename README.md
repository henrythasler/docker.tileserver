# docker.tileserver
tileserver based on mapnik 3

# how to build
sudo docker build -t="img-tileserver:0.1" .

# how to run
* sudo docker run -ti --rm -p 8080:80 img-tileserver:0.1
* sudo docker run -ti --rm img-tileserver:0.1 /sbin/my_init -- bash -l
* sudo docker run --name tileserver -d -v /home/henry/docker/docker.tileserver/map:/map -p 8080:80 img-tileserver:0.1

# work inside container
* restart runit service:
sv restart renderd

# how to git
1. git clone https://github.com/henrythasler/docker.tileserver.git
2. cd docker.tileserver
3. git remote add tileserver https://github.com/henrythasler/docker.tileserver
4. // do something
5. git add .
6. git commit -a
7. git push tileserver master

# references
https://github.com/der-stefan/OpenTopoMap/blob/master/mapnik/HOWTO_Server_16.04

https://www.linuxbabe.com/linux-server/openstreetmap-tile-server-ubuntu-16-04

https://github.com/MapFig/opentileserver

https://docs.docker.com/engine/userguide/eng-image/dockerfile_best-practices/

