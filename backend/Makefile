# Makefile for backend convenience targets
VENV=.venv
PYTHON=$(VENV)/Scripts/python.exe
.PHONY: venv install run start stop clean

venv:
	python -m venv $(VENV)
	$(PYTHON) -m pip install --upgrade pip

install: venv
	$(PYTHON) -m pip install -r requirements.txt

	run:
	# Run in foreground. Use: make run KEY=<YOUR_KEY>
	@if [ -z "$(KEY)" ]; then echo "Please provide KEY=mykey" && exit 1; fi
	$env:BACKEND_API_KEY=$(KEY); $(PYTHON) -m uvicorn src.main:app --host 0.0.0.0 --port 8000

start:
	# Start in background (Windows-friendly). Use: make start KEY=<YOUR_KEY>
	@if [ -z "$(KEY)" ]; then echo "Please provide KEY=mykey" && exit 1; fi
	powershell -NoProfile -Command "$env:BACKEND_API_KEY='$(KEY)'; Start-Process powershell -ArgumentList '-NoProfile','-Command','& \"$(PYTHON)\" -m uvicorn src.main:app --host 0.0.0.0 --port 8000' -WindowStyle Hidden"

stop:
	# Stop any python processes (simple heuristic)
	powershell -NoProfile -Command "Get-Process -Name python -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }"

clean:
	rm -rf $(VENV)
	rm -f blocked_ips.json
