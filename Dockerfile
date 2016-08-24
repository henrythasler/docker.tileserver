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

# prepare for osm2pgsql
RUN apt-get install -y \
              cmake \
              libboost-dev \
              libbz2-dev \
              libgeos++-dev \
              lua5.2 \
              liblua5.2-dev
              
# install osm2pgsql
RUN cd $BPATH \
        && git clone git://github.com/openstreetmap/osm2pgsql.git \
        && cd osm2pgsql/ \
        && mkdir build \
        && cd build \
        && cmake .. \
        && make \
        && make install
        
# get Leaflet
ENV HTML /var/www/html
RUN cd $HTML \
        && apt-get install -y unzip \
        && wget http://cdn.leafletjs.com/leaflet/v1.0.0-rc.3/leaflet.zip \
        && unzip leaflet.zip -d leaflet \
        && rm leaflet.zip

COPY html/ $HTML

# add osm data
COPY map/ /map
RUN cd /map/data/shp \
        && wget http://data.openstreetmapdata.com/simplified-land-polygons-complete-3857.zip \
        && unzip -j simplified-land-polygons-complete-3857.zip \
        && rm simplified-land-polygons-complete-3857.zip \
        && wget http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_boundary_lines_land.zip \
        && unzip ne_10m_admin_0_boundary_lines_land.zip \
        && rm ne_10m_admin_0_boundary_lines_land.zip

EXPOSE 80

# install renderd service
RUN mkdir /etc/service/renderd
COPY renderd.sh /etc/service/renderd/run
RUN chmod +x /etc/service/renderd/run

# install apache2 service
RUN mkdir /etc/service/apache2
COPY apache2.sh /etc/service/apache2/run
RUN chmod +x /etc/service/apache2/run

# /usr/sbin/apache2ctl -D FOREGROUND
# /usr/bin/supervisord --nodaemon --configuration=/etc/supervisord.conf
#CMD ["/usr/bin/supervisord", "--nodaemon", "--configuration=/etc/supervisord.conf"]

# Clean up APT when done.
#RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*