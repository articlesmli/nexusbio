
## Nexus-Bio Overview

`nexusbio` is a multi-agent biomedical research and cheminformatics workflow orchestrator built on AWS. It automates literature mining, biological pathway synthesis, and molecular design using Amazon Bedrock frontier models, custom RDKit execution sandboxes, and a human-in-the-loop (HITL) dashboard.

---

## Architecture Overview (Service Mapping)

* **Foundation Models & Orchestration:** Uses Amazon Bedrock hosting frontier models via a unified API, orchestrated via serverless code on AWS Lambda.
* **Data & Knowledge Layer (RAG & Multi-Omics):** Bedrock Knowledge Bases backed by Amazon OpenSearch Serverless, alongside an S3 Data Lake for raw abstracts and research files.
* **Cheminformatics Execution Sandbox:** A dedicated AWS ECS Fargate container bundled with Python and RDKit to safely execute and evaluate SMILES string properties.
* **Governance & HITL Gate:** Amazon Cognito for user authentication, DynamoDB for immutable audit trails and system state history, and a Streamlit frontend hosted on AWS Amplify.

---


## R&D Pipeline Architecture Mapping

Nexus-Bio bridges exact computational modeling with real-world biological engineering. The platform's engines map directly to key stages of the biotechnology and pharmaceutical R&D lifecycle, connecting to specific backend services and codebase directories:

### 1. Early Research (Pathway Design & Discovery)

* **What it covers:** Constructing metabolic routes, designing synthetic biological circuits, and running automated literature mining via Bedrock and OpenSearch.
* **How it helps:** Employs constraint-based flux optimization, mass-balance calculations, and multi-agent synthesis to explore metabolic routes and identify biological targets.
* **Relevant Files & Components:**
* `lambda/orchestrator/` — Serverless AWS Lambda code handling multi-agent workflows and Bedrock model coordination.
* `services/knowledge_base/` — Integrates Amazon Bedrock Knowledge Bases and OpenSearch Serverless for automated literature mining and RAG.
* `data/s3_lake/` — S3 Data Lake storing raw research abstracts and chemical datasets.



### 2. Pre-Clinical Work (Simulation & Molecular Optimization)

* **What it covers:** Dynamic pathway simulation, kinetic modeling, and safe cheminformatics execution.
* **How it helps:** Leverages isolated AWS ECS Fargate containers running Python and RDKit to execute and evaluate SMILES string properties, predicting molecular characteristics before physical lab testing.
* **Relevant Files & Components:**
* `containers/rdkit_sandbox/` — Dedicated AWS ECS Fargate container bundled with Python and RDKit for safe SMILES string evaluation and property calculations.
* `engines/simulation/` — Code handling kinetic modeling, flux optimization, and mass-balance calculations.



### 3. Validation & Governance Loops (HITL & Audit Trails)

* **What it covers:** Data interpretation, immutable tracking, and human-in-the-loop (HITL) validation.
* **How it helps:** Utilizes DynamoDB audit trails and a Streamlit frontend to ensure full compliance, safety checks, and seamless human oversight throughout complex biological and chemical workflows.
* **Relevant Files & Components:**
* `frontend/` — Streamlit application hosted on AWS Amplify providing the user interface and HITL control gates.
* `backend/governance/` — DynamoDB integration maintaining immutable audit trails and system state history.
* `auth/` — Amazon Cognito configuration handling user authentication and role-based access.

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
│       ├── pathway_synthesizer.py      # Synthesizes pathways via Llama 3 / Claude
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
cdk bootstrap aws://<YOUR_ACCOUNT_ID>/us-east-1

```


2. **Build and Deploy Stacks**:
```bash
npm run build
cdk deploy --all

```
