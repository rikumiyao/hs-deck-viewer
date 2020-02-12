#!/bin/sh
wget https://github.com/HearthSim/hs-card-tiles/archive/master.zip -N
unzip -u master
python3 updateCards.py
python3 generate_tiles.py
