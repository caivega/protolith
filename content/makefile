
FILE=protolith.js
BASHGETFILES=dir *.js /b /s >> tmp.txt
BASHCOMBINE=(for /F "tokens=*" %A in (tmp.txt) do type %A >> $(FILE) & echo. >> $(FILE)) >nul
#for /F "tokens=*" %A in (tmp.txt) do type %A >> t.js & echo. >> t.js
default: all

all: build zip send

adb: zip usb

build: concat compress

_concremoveprev:
	rm -f protolith.js protolith.min.js
_concgetfiles:
	echo "$(BASHGETFILES)" | cmd.exe
_conccombine:
	echo '$(BASHCOMBINE)' | cmd.exe
_concremoveextra:
	rm -f tmp.txt

concat: _concremoveprev _concgetfiles _conccombine _concremoveextra

compress:
	java -jar ../extra/yuicompressor-2.4.8.jar protolith.js -o protolith.min.js

zip: clean
	7z.exe a -tzip protolith.zip ./* -mx=9 -xr!protolith.html -xr!indexCocoon.html -xr!indexDesktop.html | grep "ing archive"

send: 
	scp -i ../bbrwn.pem ./protolith.zip ubuntu@bbrwn.com:/var/www/html/protolith.zip

usb:
	echo "adb push ./protolith.zip /sdcard/" | cmd.exe

fixusb:
	taskkill -f -t -im adb.exe

clean: 
	rm -f protolith.zip tmp.txt protolith.js protolith.min.js
