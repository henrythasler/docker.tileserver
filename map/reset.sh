#!/bin/sh
# this scripts restarts renderd and clears all cached data
sv restart renderd
rm -r /var/lib/mod_tile/default/*