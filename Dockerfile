FROM public.ecr.aws/lambda/python:3.12

# Copy requirements and install python packages
COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application scripts into the Lambda task root
COPY schemas.py agents.py discovery_network.py lambda_handler.py ${LAMBDA_TASK_ROOT}/

# Set the command to invoke the Lambda handler function
CMD ["lambda_handler.lambda_handler"]
