#!/bin/sh
exec /sbin/setuser www-data /usr/local/bin/renderd -f -c /usr/local/etc/renderd.conf >>/var/log/renderd.log 2>&1