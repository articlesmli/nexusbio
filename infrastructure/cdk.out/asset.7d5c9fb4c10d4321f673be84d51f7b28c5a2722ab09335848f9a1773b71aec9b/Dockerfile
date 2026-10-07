FROM python:3.11-slim

WORKDIR /app

# Install dependencies if you have a requirements file in cheminformatics_sandbox, 
# or install uvicorn directly
RUN pip install --no-cache-dir uvicorn fastapi

# Copy application code
COPY . /app/

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]