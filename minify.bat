copy /b src\core.js+src\SDD.js+src\SDD.Source.js+src\SDD.Source.json.js+src\SDD.Table.js dist\EVEoj.core.js
copy /b src\map.js+src\map.System.js dist\EVEoj.map.js
copy /b src\IGB.js dist\EVEoj.IGB.js
copy /b dist\EVEoj.core.js+dist\EVEoj.map.js+dist\EVEoj.IGB.js dist\EVEoj.js

java -jar D:\Projects\yuicompressor-2.4.8.jar -v --charset utf-8 -o dist\EVEoj.core.min.js dist\EVEoj.core.js
java -jar D:\Projects\yuicompressor-2.4.8.jar -v --charset utf-8 -o dist\EVEoj.map.min.js dist\EVEoj.map.js
java -jar D:\Projects\yuicompressor-2.4.8.jar -v --charset utf-8 -o dist\EVEoj.IGB.min.js dist\EVEoj.IGB.js
java -jar D:\Projects\yuicompressor-2.4.8.jar --charset utf-8 -o dist\EVEoj.min.js dist\EVEoj.js
