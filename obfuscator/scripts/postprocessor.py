#!/usr/bin/python

"""
This is a simple script for preprocessing
@aspects
@export
@proex
@print
"""

import os  # File stuff
import sys # Command line parsing


instructions = "zipit.py:  Simple zipfile creation script." + \
               "recursively zips files in a directory into" + \
               "a single archive." +\
               "e.g.:  python zipit.py myfiles myfiles.zip"


def postprocess(infile, outfile):
  rf = open(infile, 'r')
  wf = open(outfile, 'wc')
  dm = "dm"

  for line in rf:
    if "$.aspect(\"" in line:
      newline = line
      result = ""
      while "$.aspect(" in newline:
        pos = newline.find("$.aspect(\"")
        result += newline[:pos]
        newline = newline[pos+10:]
        end = newline.find("\");")
        aspect = newline[:end]

        asp = aspect.split("dm")
        if len(asp) == 2:
          aspect = ("%s%s%s") % (asp[0],dm,asp[1])
        newline = newline[end+3:]
        result += aspect
      result += newline
      wf.write(result)
    else:
      wf.write(line)
  rf.close()
  wf.close()

# Notice the __name__=="__main__"
# this is used to control what Python does when it is called from the
# command line.  I'm sure you've seen this in some of my other examples.
if __name__=="__main__":
    if len(sys.argv) >= 3:
        postprocess (sys.argv[1], sys.argv[2])
    else:
        print instructions

