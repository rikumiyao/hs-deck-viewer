#!/bin/sh
set -e #Exit immediately if a command exits with a non-zero status.
wget https://github.com/HearthSim/hs-card-tiles/archive/master.zip -N
unzip -uq master
rm master.zip
python3 updateCards.py
python3 generate_tiles.py
aws s3 cp ../src/resources/Tiles/ s3://yaytears/resources/Tiles --recursive --acl public-read
rm -r hs-card-tiles-master
rm -r ../src/resources/Tiles
