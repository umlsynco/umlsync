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


def preprocess(infile, outfile):
  rf = open(infile, 'r')
  wf = open(outfile, 'w')
  exportf = open("./externals_ext.js", 'w')
  aspecNextLine = False
  exportNextLine = False
  printExport = ""
  currentExportProto = ""
  currentExportProtoObj = ""


  for line in rf:
    if aspecNextLine:
      wf.write("%s%s%s\n" % ("$.aspect('", line.strip(' \t\n\r'), "');"))
      aspecNextLine = False
    elif exportNextLine:
      newline = line.strip(' \t\n\r')
      extraline = ""
      # Export internal method/fields
      # Example:  this.euid = "blahBlahBlah";
      if "this." in newline:
        field = newline.rsplit('=')[0].rsplit("this.")[1].strip(" ")
        # printExport = "%s%s%s'] = %s%s;\n" % (printExport,currentExportProto,field,currentExportProtoObj,field)
        extraline = "this['" + field + "'] = this." + field + ";"
      else:
        field = newline.rsplit(':')[0]
        if "'" in field:
            field = field.rsplit('\'')[1]
        printExport = "%s%s%s'] = %s%s;\n"%(printExport, currentExportProto, field, currentExportProtoObj, field)
      exportNextLine = False
      wf.write(line)
      wf.write(extraline)
    else:
      wf.write(line)

    if "//@aspect" in line:
      aspecNextLine = True
    if "//@export:" in line:
      splitExport = line.strip(' \t\n\r').rsplit(':')
      exportNamespace = splitExport[1]
      exportPath = exportNamespace.rsplit('.')
      if len(splitExport) > 2:
        if "dm" == exportPath[0]:
          currentExportProto = "dm['%s']['%s'].prototype['" % (exportPath[1],
              exportPath[2])
          currentExportProtoObj = "%s.prototype." % (exportNamespace)
          printExport =  "dm['%s']['%s'] = %s;\n" % (exportPath[1],
              exportPath[2],exportNamespace)
      else:
        if "dm" == exportPath[0]:
          currentExportProto = "dm['%s']['%s'].prototype['" % (exportPath[1],exportPath[2])
          currentExportProtoObj = "dm['%s']['%s'].prototype." % (exportPath[1],exportPath[2])
          printExport =  "dm['%s']['%s'] = dm['%s']['%s'];\n" % (exportPath[1],exportPath[2],exportPath[1],exportPath[2])
    if "//@proexp" in line:
      exportNextLine = True
    if "//@print" in line:
      exportf.write(printExport)
      wf.write(printExport)
      printExport = ""
      currentExportProto = ""
      currentExportProtoObj = ""

  rf.close()
  wf.close()
  exportf.close()

# Notice the __name__=="__main__"
# this is used to control what Python does when it is called from the
# command line.  I'm sure you've seen this in some of my other examples.
if __name__=="__main__":
    if len(sys.argv) >= 3:
        preprocess (sys.argv[1], sys.argv[2])
    else:
        print instructions

