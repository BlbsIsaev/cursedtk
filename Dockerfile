FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
	gcc \
	pkg-config \
	default-libmysqlclient-dev \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY /backend/app ./app/

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
