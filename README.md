# NexusBio Cheminformatics Sandbox

NexusBio is an automated cheminformatics and bioinformatics sandbox environment designed for scalable containerized processing. This repository features a fully automated CI/CD pipeline using GitHub Actions, successfully migrated to **Microsoft Azure Container Apps and Azure Container Registry (ACR)**.

---

## Project Directory Structure

```text
nexusbio/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                # Automated GitHub Actions CI/CD pipeline
├── cheminformatics_sandbox/
│   ├── tests/                       # Python test suite
│   ├── utils/                       # Utility scripts and helpers
│   ├── Dockerfile                   # Application container definition
│   ├── Dockerfile.base              # Base RDKit environment container definition
│   ├── main.py                      # Core sandbox entrypoint
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── app.py                       # Frontend web service application
│   ├── Dockerfile                   # Frontend container configuration
│   └── requirements.txt             # Frontend dependencies
├── infrastructure/
│   ├── bin/                         # Deployment entrypoints (nexusbio.ts, etc.)
│   └── lib/                         # Infrastructure stacks (compute, networking, storage)
├── lambda_orchestrator/             # Serverless orchestrator components & agents
│   └── agents/                      # Specialized agent modules (literature miner, molecular design, etc.)
│   ├── package.json                 # Node.js infrastructure dependencies
│   └── tsconfig.json                # TypeScript configuration
├── .gitignore
├── docker-compose.yaml              # Local multi-container orchestration
├── Dockerfile                       # Root container configuration
├── README.md
├── requirements.txt
└── test_orchestrator.py             # Orchestration test suite

```

---

## Architecture & Tech Stack

* **Cloud Provider**: Microsoft Azure (`westus2`)
* **Container Registry**: Azure Container Registry (`nexusbio.azurecr.io`)
* **Infrastructure**: Azure Resource Group (`rg-container-apps`)
* **Core Frameworks**: Python 3.11, TypeScript / Node.js, Docker, RDKit

---

## CI/CD Pipeline (`ci-cd.yml`)

The automated pipeline handles three core stages on every push to `main`:

1. **Python Testing (`test-python`)**:
* Sets up Python 3.11 with pip caching.
* Runs linting (`flake8`) and executes the `pytest` test suite inside `cheminformatics_sandbox/tests/`.


2. **Infrastructure Validation (`test-infrastructure`)**:
* Sets up Node.js and builds infrastructure configurations within the `infrastructure/` directory.


3. **Azure Deployment (`deploy-azure`)**:
* Authenticates securely with Azure using service principal credentials (`AZURE_CREDENTIALS`).
* Logs into **Azure Container Registry** (`nexusbio.azurecr.io`).
* Builds and pushes the base RDKit container image directly to Azure.


---

## Getting Started Locally

### Prerequisites

* Python 3.11+
* Docker & WSL (Ubuntu)
* Azure CLI (`az`)

### Local Setup & Testing

1. **Clone the repository:**
```bash
git clone https://github.com/articlesmli/nexusbio.git
cd nexusbio

```


2. **Set up a Python virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

```


3. **Run the test suite:**
```bash
PYTHONPATH=. pytest cheminformatics_sandbox/tests/

```



---

## Azure Secrets Configuration

To enable GitHub Actions deployments, configure the following repository secrets under **Settings > Secrets and variables > Actions**:

* `AZURE_CREDENTIALS`: The full JSON service principal authentication block.
* `AZURE_REGISTRY_NAME`: Set to `nexusbio`.
