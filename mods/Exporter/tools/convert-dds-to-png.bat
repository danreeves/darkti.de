@echo off
setlocal enabledelayedexpansion

for /r %1 %%f in (*.dds) do (
	magick mogrify -format png "%%f"
	del "%%f"
)
