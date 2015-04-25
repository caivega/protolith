@ECHO OFF
del protolith.js*
del protolith.min.js*
del ..\zip\index.html*

dir *.js /b /s >> tmp.txt

for /F "tokens=*" %%A in (tmp.txt) do type %%A >> protolith.js & echo. >> protolith.js
del *tmp.txt

REM java -jar ..\extra\yuicompressor-2.2.5.jar protolith.js -o protolith.min.js

type ..\extra\header.html >> ..\zip\index.html
type protolith.js >> ..\zip\index.html
type ..\extra\footer.html >> ..\zip\index.html

REM xcopy display ..\zip\display /s /e /Y
REM xcopy maps ..\zip\maps /s /e /Y
REM xcopy save ..\zip\save /s /e /Y
REM xcopy sound ..\zip\sound /s /e /Y

REM del ..\zip\display\*.js
REM del ..\zip\sound\*.js
REM del ..\zip\maps\*.js
REM del ..\zip\save\*.js

