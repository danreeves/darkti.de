@REM #!/bin/bash

@REM mkdir -p "$1/pngs"

@REM for black_file in "$1"/*_black.dds; do
@REM 	white_file="${black_file/black/white}"
@REM 	filename="$(basename -- $black_file)"
@REM 	out_file="$1/pngs/${filename/_black.dds/.png}"
@REM 	echo $out_file;
@REM 	convert $black_file $white_file -alpha off \
@REM 		\( -clone 0,1 -compose difference -composite -negate \) \
@REM 		\( -clone 0,2 +swap -compose divide -composite \) \
@REM 		-delete 0,1 +swap -compose Copy_Opacity -composite \
@REM 		$out_file
@REM done;

@echo off
setlocal enabledelayedexpansion

if "%~1" == "" (
    echo Usage: %~nx0 directory
    exit /b 1
)

set "input_dir=%~1"
set "output_dir=%input_dir%\pngs"

if not exist "%output_dir%" (
    mkdir "%output_dir%"
)

for %%f in ("%input_dir%\*_black.png") do (
    set "black_file=%%f"
    set "white_file=!black_file:_black=_white!"
    set "filename=%%~nf"
    set "out_file=%output_dir%\!filename:_black=.png!"
    echo !out_file!
    magick "!black_file!" "!white_file!" -alpha off ^
			^( -clone 0,1 -compose difference -composite -negate ^) ^
			^( -clone 0,2 +swap -compose divide -composite ^) ^
			-delete 0,1 +swap -compose Copy_Opacity -composite ^
			"!out_file!"
)
