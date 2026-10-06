
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
        ---
        `agents/` 

        * **`literature_miner.py`**: Queries the Amazon Bedrock Knowledge Base (backed by OpenSearch Serverless) to search through biomedical literature using the `retrieve` API, providing a fallback mock data chunk for local development.
        * **`molecular_design.py`**: Communicates with the ECS Fargate Cheminformatics Sandbox by sending compound SMILES strings via an HTTP POST request for property evaluation, including a fallback mock response if the sandbox container is offline.
        * **`pathway_synthesizer.py`**: Sends retrieved literature context to the Meta Llama 3 70B Instruct model via Amazon Bedrock (`invoke_model`) to analyze pathway mechanisms, target proteins, and suggest structural modifications in JSON format.
        ---

        * **`handler.py`**: Serves as the main AWS Lambda entrypoint (`lambda_handler`) that orchestrates the multi-agent loop, coordinates the literature mining and molecular evaluation agents, and records immutable activity logs to the DynamoDB audit trail table.


### 2. Pre-Clinical Work (Simulation & Molecular Optimisation)
* **What it covers:** Dynamic pathway simulation, kinetic modeling, and safe cheminformatics execution.
* **How it helps:** Leverages isolated environments to execute and evaluate SMILES string properties and molecular characteristics before physical lab testing.
* **Relevant Files & Components:**
    * `cheminformatics_sandbox/` - Dedicated workspace for safely executing and evaluating cheminformatics and SMILES string properties.
        * **`Dockerfile`**: Configures a lightweight Python 3.11 slim image, installs essential system packages required for chemical rendering (`build-essential`, `libgl1`, `libxrender1`), installs python dependencies, exposes port 8000, and launches the application using Uvicorn.
        * **`main.py`**: Implements a FastAPI application that provides two core endpoints: `/evaluate-smiles` (which takes molecular SMILES input, validates it, computes properties, and returns structured metadata) and `/health` for checking service status.

        * **`utils/descriptors.py`**: Contains helper functions utilizing the RDKit library to parse SMILES strings, generate canonical forms, compute quantitative estimate of drug-likeness (QED), molecular weight, logP, and check Lipinski's Rule of 5 violations.


### 3. Validation & User Interface Loops
* **What it covers:** Data interpretation, workflow orchestration, and user interaction.
* **How it helps:** Provides an interactive interface for users to oversee and run complex biological and chemical workflows.
* **Relevant Files & Components:**
    * `frontend/` - User interface components for interacting with the platform.
       * `app.py` builds an interactive, multi-tab web application called NexusBio - HITL Research Dashboard using Streamlit. It simulates a control panel designed for biomedical researchers, safety officers, and auditors to monitor automated multi-agent workflows.
       * `Dockerfile` packages this Python 3.11 Streamlit application into a lightweight container, exposing port 8501 so it can be deployed on cloud services like AWS Amplify or ECS.

    * `infrastructure/` - Infrastructure configurations and deployment files.
        * **`package.json`**: Defines the project metadata, build scripts (`build`, `watch`, `test`, `cdk`), and project dependencies like `aws-cdk-lib` and `constructs`.
        * **`package-lock.json`**: Automatically generated file that locks exact dependency versions to ensure consistent builds across different environments.
        * **`tsconfig.json`**: TypeScript compiler configuration file that specifies target ECMAScript versions (`ES2022`), module systems (`commonjs`), and strict type-checking options.
        * **`cdk.json`**: Configuration file for the AWS CDK toolkit that specifies how the app is executed (e.g., using `ts-node` to run `bin/nexusbio.ts`) and watch directories.
        * **`cdk.context.json`**: Caches environment-specific metadata queried from AWS (such as available Availability Zones for your region) to speed up CDK syntheses.

        ---

       `bin/` - entry point

        * **`nexusbio.ts`** (and compiled **`nexusbio.js` / `nexusbio.d.ts**`): The main entry point for the CDK application. It instantiates the CDK `App`, defines the AWS environment region/account, creates instances of the Networking, Storage, and Compute stacks, and establishes explicit inter-stack dependencies.

        ---

       `lib/` - infrastructure stacks

        * **`networking_stack.ts`** (and compiled **`networking_stack.js` / `networking_stack.d.ts**`): Defines the custom VPC (`NexusBioVPC`) with public subnets and private subnets with egress via a NAT gateway to safely isolate internal workloads.
        * **`storage_stack.ts`** (and compiled **`storage_stack.js` / `storage_stack.d.ts**`): Manages persistent data resources, including an S3 Data Lake bucket, a DynamoDB audit trail table, and an OpenSearch Serverless vector store collection (`nexusbio-literature-vector-store`) complete with encryption and network security policies.
        * **`compute_stack.ts`** (and compiled `compute_stack.js` / `compute_stack.d.ts`): Deploys compute workloads inside the VPC, including an ECS Fargate cluster running a cheminformatics sandbox behind an internal load balancer, and a Python Lambda orchestrator with least-privilege permissions to access the S3 bucket and DynamoDB table.
            
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
