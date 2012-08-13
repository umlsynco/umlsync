#!/bin/bash


if [ ! -d dm ]
then
##mkdir -p dm
  ln -s ../diagrammer/dm .
fi

if [ ! -d css ]
then
#  mkdir -p css
  ln -s ../diagrammer/css .
fi

if [ ! -d images ]
then
#  mkdir -p images
  ln -s ../diagrammer/images .
fi

if [ ! -d tests ]
then
#  mkdir -p tests
  ln -s ../diagrammer/tests .
fi

if [ ! -d js ]
then
#  mkdir -p tests
  ln -s ../diagrammer/js .
fi


python scripts/preprocessor.py dm/ds/diagram.js dm/ds/diagram.pre.js

java -jar 3pp-closure-compiler/compiler.jar \
--compilation_level ADVANCED_OPTIMIZATIONS --js dm/ds/diagram.pre.js \
--externs ./js/jquery.min.js \
--externs ./js/jquery-ui.js \
--externs ./jquery_ext.js \
--externs ./js/3pp/base64/jquery.base64.js \
--js_output_file dm/ds/diagram.min.a.js


--externs ../../js/jquery-ui.js \
--externs ../../jquery_ext.js \
--externs ../../js/3pp/base64/jquery.base64.js \

python scripts/postprocessor.py dm/ds/diagram.min.a.js dm/ds/diagram.min.js
