FROM 089340569022.dkr.ecr.eu-west-2.amazonaws.com/nexusbio-sandbox-base:latest

WORKDIR /app

# Copy the rest of your application code into the container
COPY . /app/

EXPOSE 8000

# Start FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]