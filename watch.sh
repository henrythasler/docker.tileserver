#!/usr/bin/env bash
# script:  watch
# author:  Mike Smullin <mike@smullindesign.com>
# license: GPLv3
# description:
#   watches the given path for changes
#   and executes a given command when changes occur
# usage:
#   watch <path>
#
# modified by Henry Thasler to generate new map.xml and purge render cache on change
# use path to carto-project as <path>
# example: /watch.sh /map/mycyclemap/

path=$1
shift
sha=0
update_sha() {
  sha=`ls -lR --time-style=full-iso $path | sha1sum`
}
update_sha
previous_sha=$sha
build() {
  echo -en " building...\n\n"
  carto $path/project.mml > /map/map.xml
  sleep 1
  /usr/src/refresh/reset.sh
  echo -en "\n--> resumed watching."
}
compare() {
  update_sha
  if [[ $sha != $previous_sha ]] ; then
    echo -n "change detected,"
    build
    previous_sha=$sha
  else
    echo -n .
  fi
}
#trap build SIGINT
#trap exit SIGQUIT

echo -e  "--> Press Ctrl+C to force build, Ctrl+\\ to exit."
echo -en "--> watching \"$path\"."
while true; do
  compare
  sleep 1
done