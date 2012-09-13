#!/usr/bin/python

"""
This is a simple script for ifdef preprocessing
@aspects
@export
@proex
@print
"""

import os  # File stuff
import sys # Command line parsing
import shutil # Copy file


instructions = "zipit.py:  Simple zipfile creation script." + \
               "recursively zips files in a directory into" + \
               "a single archive." +\
               "e.g.:  python zipit.py myfiles myfiles.zip"


def preprocess(infile, outfile, options):
  rf = open(infile, 'r')
  wf = open(outfile, 'wc')
  skeepNextLines = False
  options = "//@ifdef " + options
  skeepOneLine = False

  for line in rf:
    if "//@ifdef" in line:
        skeepOneLine = True
        if options in line:
            skeepNextLines = False
        else:
            skeepNextLines = True
        
    if "//@endif" in line:
      skeepOneLine = True
      skeepNextLines = False

    if "//@else" in line:
      skeepOneLine = True
      skeepNextLines = not skeepNextLines
    
    if (not skeepNextLines) and (not skeepOneLine):
      wf.write(line)

    skeepOneLine = False

  rf.close()
  wf.close()

# Notice the __name__=="__main__"
# this is used to control what Python does when it is called from the
# command line.  I'm sure you've seen this in some of my other examples.
if __name__=="__main__":
    if len(sys.argv) >= 3:
        arg = sys.argv[1] + ".temp"
        preprocess (sys.argv[1],  arg, sys.argv[2])
        shutil.move(arg, sys.argv[1])        
    else:
        print instructions
    sys.exit(0)

