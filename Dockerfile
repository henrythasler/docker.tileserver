# Ubuntu 16.04
# see https://github.com/phusion/baseimage-docker#using
FROM phusion/baseimage:0.9.19

MAINTAINER Henry Thasler <docker@thasler.org>

# Use baseimage-docker's init system.
CMD ["/sbin/my_init"]

# build path
ENV BPATH /usr/src

# install dependencies
RUN apt-get update \
        && apt-get install -y \
              git \
              wget \
              curl \
              libmapnik3.0 \
              libmapnik-dev \
              mapnik-utils \
              python-mapnik \
              apt-utils \
              ca-certificates
                              
# Verify Mapnik install
RUN python -c 'import mapnik'
# install mod_tile & renderd
ENV MODTILE_SOURCE https://github.com/openstreetmap/mod_tile.git

RUN apt-get install -y \
              autoconf \
              apache2 \
              apache2-dev

RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

RUN /bin/bash -c 'cd $BPATH \
        && git clone --depth 1 $MODTILE_SOURCE \
        && cd mod_tile \
        && ./autogen.sh \
        && ./configure \
        && make \
        && make install \
        && make install-mod_tile'
     
# install Carto
ENV HOME=/tmp
RUN apt-get install -y npm \
        && ln -s /usr/bin/nodejs /usr/bin/node \
        && npm install -g carto

# Configure mod_tile  
ADD mod_tile.load /etc/apache2/mods-available/
ADD mod_tile.conf /etc/apache2/mods-available/
RUN a2enmod mod_tile \
        && install --owner=www-data --group=www-data -d /var/lib/mod_tile 

# Configure renderd
ADD renderd.conf /usr/local/etc/renderd.conf
RUN install --owner=www-data --group=www-data -d /var/run/renderd
        
# Setup supervisord
#ENV SUPERVISOR_VERSION=3.2.0-2
#COPY supervisord.conf /etc/supervisord.conf
#RUN apt-get install -y supervisor=${SUPERVISOR_VERSION}

COPY html/ /var/www/html

# add osm data
COPY map/ /map

EXPOSE 80

RUN mkdir /etc/service/renderd
COPY renderd.sh /etc/service/renderd/run
RUN chmod +x /etc/service/renderd/run

RUN mkdir /etc/service/apache2
COPY apache2.sh /etc/service/apache2/run
RUN chmod +x /etc/service/apache2/run


# /usr/sbin/apache2ctl -D FOREGROUND
# /usr/bin/supervisord --nodaemon --configuration=/etc/supervisord.conf
#CMD ["/usr/bin/supervisord", "--nodaemon", "--configuration=/etc/supervisord.conf"]

# Clean up APT when done.
#RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*