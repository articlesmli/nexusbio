
## NexusBio Overview

`nexusbio` is a multi-agent biomedical research and cheminformatics workflow orchestrator built on AWS. It automates literature mining, biological pathway synthesis, and molecular design using Amazon Bedrock frontier models, custom RDKit execution sandboxes, and a human-in-the-loop (HITL) dashboard.

---

## Architecture Overview (Service Mapping)

* **Foundation Models & Orchestration:** Uses Amazon Bedrock hosting frontier models via a unified API, orchestrated via serverless code on AWS Lambda.
* **Data & Knowledge Layer (RAG & Multi-Omics):** Bedrock Knowledge Bases backed by Amazon OpenSearch Serverless, alongside an S3 Data Lake for raw abstracts and research files.
* **Cheminformatics Execution Sandbox:** A dedicated AWS ECS Fargate container bundled with Python and RDKit to safely execute and evaluate SMILES string properties.
* **Governance & HITL Gate:** Amazon Cognito for user authentication, DynamoDB for immutable audit trails and system state history, and a Streamlit frontend hosted on AWS Amplify.

---


## R&D Pipeline Architecture Mapping

NexusBio bridges exact computational modeling with real-world biological engineering. The platform's engines map directly to key stages of the biotechnology and pharmaceutical R&D lifecycle, connecting to specific backend services and codebase directories:

### 1. Early Research (Pathway Design & Discovery)
* **What it covers:** Constructing metabolic routes, designing synthetic biological circuits, and running automated literature mining.
* **How it helps:** Employs multi-agent synthesis to explore metabolic routes and identify biological targets.
* **Relevant Files & Components:**
    * `lambda_orchestrator/` - Serverless code handling multi-agent workflows and model coordination.


### 2. Pre-Clinical Work (Simulation & Molecular Optimisation)
* **What it covers:** Dynamic pathway simulation, kinetic modeling, and safe cheminformatics execution.
* **How it helps:** Leverages isolated environments to execute and evaluate SMILES string properties and molecular characteristics before physical lab testing.
* **Relevant Files & Components:**
    * `cheminformatics_sandbox/` - Dedicated workspace for safely executing and evaluating cheminformatics and SMILES string properties.


### 3. Validation & User Interface Loops
* **What it covers:** Data interpretation, workflow orchestration, and user interaction.
* **How it helps:** Provides an interactive interface for users to oversee and run complex biological and chemical workflows.
* **Relevant Files & Components:**
    * `frontend/` - User interface components for interacting with the platform.
    * `infrastructure/` - Infrastructure configurations and deployment files.
    
---

## Project File Tree

```text
nexusbio/
├── .env.example
├── .gitignore
├── Dockerfile                          # Root container file for AWS Lambda Orchestrator
├── docker-compose.yaml                 # Local multi-container orchestrator (Frontend + Sandbox)
├── README.md
├── requirements.txt
│
├── frontend/                           # Governance & HITL Gate (Streamlit)
│   ├── app.py
│   ├── Dockerfile                      # Dedicated container build for the UI dashboard
│   └── requirements.txt
│
├── lambda_orchestrator/                # Foundation Models & Orchestration (AWS Lambda + Agents)
│   ├── handler.py                      # Main Lambda entry point
│   ├── requirements.txt
│   └── agents/
│       ├── __init__.py
│       ├── literature_miner.py         # Interacts with Bedrock & OpenSearch Serverless[cite: 2]
│       ├── pathway_synthesizer.py      # Synthesises pathways via Llama 3 / Claude
│       └── molecular_design.py         # Interfaces with the Cheminformatics Sandbox[cite: 3]
│
├── cheminformatics_sandbox/            # Cheminformatics Execution Sandbox (ECS Fargate + RDKit)
│   ├── Dockerfile                      # Mandatory for compiled C++ / RDKit binaries[cite: 3]
│   ├── main.py                         # FastAPI wrapper for SMILES evaluation[cite: 3]
│   ├── requirements.txt
│   └── utils/
│       └── descriptors.py
│
└── infrastructure/                     # AWS CDK (TypeScript) infrastructure-as-code
    ├── bin/
    │   └── nexusbio.ts                 # CDK application entry point
    └── lib/
        ├── networking_stack.ts         # VPC, Subnets & Internal routing for Lambda-to-Sandbox
        ├── storage_stack.ts            # S3 Data Lake, DynamoDB Audit Trail & OpenSearch Serverless
        └── compute_stack.ts            # Lambda Orchestrator & ECS Fargate Sandbox Service

```

---

## Deployment Instructions

1. **Bootstrap Environment**:
```bash
cd infrastructure
cdk bootstrap aws://<YOUR_ACCOUNT_ID>/eu-west-2

```


2. **Build and Deploy Stacks**:
```bash
npm run build
cdk deploy --all

```
