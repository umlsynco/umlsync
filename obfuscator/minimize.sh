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

# On the begining stage only jQuery externals available
cat ./jquery_ext.js > ./externals.js

# Create the list of export. Generate externals_ext.js the list of interface which export the compilation module.
python scripts/preprocessor.py dm/dm/loader.js dm/dm/loader.pre.js

# 
java -jar 3pp-closure-compiler/compiler.jar \
--compilation_level ADVANCED_OPTIMIZATIONS --js dm/dm/loader.pre.js \
--externs ./externals.js \
--js_output_file dm/dm/loader.min.a.js

#postprocessor for the loader
python scripts/postprocessor.py dm/dm/loader.min.a.js dm/dm/loader.min.js

#extend externals
cat externals_ext.js >> ./externals.js

# processing diagram.js
python scripts/preprocessor.py dm/ds/diagram.js dm/ds/diagram.pre.js

java -jar 3pp-closure-compiler/compiler.jar \
--compilation_level ADVANCED_OPTIMIZATIONS --js dm/ds/diagram.pre.js \
--externs ./externals.js \
--js_output_file dm/ds/diagram.min.a.js

#extend externals
cat externals_ext.js >> ./externals.js

python scripts/postprocessor.py dm/ds/diagram.min.a.js dm/ds/diagram.min.js

### process dm/ds/base.js
python scripts/preprocessor.py dm/ds/base.js dm/ds/base.pre.js

java -jar 3pp-closure-compiler/compiler.jar \
--compilation_level ADVANCED_OPTIMIZATIONS --js dm/ds/base.pre.js \
--externs ./externals.js \
--js_output_file dm/ds/base.min.a.js

python scripts/postprocessor.py dm/ds/base.min.a.js dm/ds/base.min.js

#extend externals
cat externals_ext.js >> ./externals.js


################## FRAMEWORK
### process dm/ds/base.js
python scripts/preprocessor.py dm/hs/framework.js dm/hs/framework.pre.js

java -jar 3pp-closure-compiler/compiler.jar \
--compilation_level ADVANCED_OPTIMIZATIONS --js dm/hs/framework.pre.js \
--externs ./externals.js \
--js_output_file dm/hs/framework.min.a.js

python scripts/postprocessor.py dm/hs/framework.min.a.js dm/hs/framework.min.js

#extend externals
cat externals_ext.js >> ./externals.js


# python scripts/preprocessor.py dm/es/class.js dm/es/class.pre.js

#cat dm/ds/diagram.js > dm/ds/diagram.pre.js
#cat dm/ds/base.pre.js >> dm/ds/diagram.pre.js
#python scripts/postprocessor.py dm/ds/base.min.a.js dm/ds/base.min.js


# --js dm/hs/framework.js \
# --js dm/ms/vp/vp.js \
--js dm/dm/loader.js \
--js dm/es/component.js \
--js dm/cs/aggregation.js \
--js dm/cs/anchor.js \
--js dm/cs/association.js \
--js dm/cs/composition.js \
--js dm/cs/dependency.js \
--js dm/cs/generalization.js \
--js dm/cs/iobserver.js \
--js dm/cs/lifeline.js \
--js dm/cs/manytomany.js \
--js dm/cs/nested.js \
--js dm/cs/onetomany.js \
--js dm/cs/onetoone.js \
--js dm/cs/realization.js \
--js dm/cs/selfassociation.js \
--externs ./js/3pp/base64/jquery.base64.js \

# --externs ../../js/jquery-ui.js \
# --externs ../../jquery_ext.js \
# --externs ../../js/3pp/base64/jquery.base64.js \


