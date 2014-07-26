copy /b core.js+data.src_json.js+data.src_object.js+IGB.js+map.js+map.System.js EVEoj.all.js
java -jar D:\Projects\yuicompressor-2.4.8.jar -v --charset utf-8 -o ..\js\EVEoj.all.min.js EVEoj.all.js