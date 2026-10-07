# Point to your own ECR base image instead of python:3.11-slim
FROM 089340569022.dkr.ecr.eu-west-2.amazonaws.com/nexusbio-sandbox-base:latest

WORKDIR /app

# Copy only your lightweight code (main.py, utils/, etc.)
COPY . /app/

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]
