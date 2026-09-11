FROM python:3.10-slim

WORKDIR /app

# Install build dependencies for C extensions (scipy/numpy/implicit)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir sentence-transformers torch --extra-index-url https://download.pytorch.org/whl/cpu

COPY . .

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
