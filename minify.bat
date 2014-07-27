copy /b src\core.js+src\SDD.js+src\SDD.Source.js+src\SDD.Source.json.js+src\SDD.Table.js+src\IGB.js dist\EVEoj.js
copy /b src\map.js+src\map.System.js dist\EVEoj.map.js

java -jar D:\Projects\yuicompressor-2.4.8.jar -v --charset utf-8 -o dist\EVEoj.min.js dist\EVEoj.js
java -jar D:\Projects\yuicompressor-2.4.8.jar -v --charset utf-8 -o dist\EVEoj.map.min.js dist\EVEoj.map.js
