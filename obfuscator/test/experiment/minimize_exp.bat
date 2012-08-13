@ECHO ON

C:\Windows\System32\java.exe -jar C:\closure-compiler\compiler.jar --debug true --compilation_level ADVANCED_OPTIMIZATIONS --js experiment.js --js_output_file experiment.min.js

::--externs experiment_ext1.js
