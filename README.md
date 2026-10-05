
`nexusbio` is a multi-agent biomedical research and cheminformatics workflow orchestrator built on AWS[cite: 5]. It automates literature mining, biological pathway synthesis, and molecular design using Amazon Bedrock frontier models, custom RDKit execution sandboxes, and a human-in-the-loop (HITL) dashboard.

---

## Architecture Overview (Service Mapping)

1. **Foundation Models & Orchestration**: Uses Amazon Bedrock hosting **Meta Llama 3** models via a unified API, orchestrated via serverless code on AWS Lambda.
2. **Data & Knowledge Layer (RAG & Multi-Omics)**: Bedrock Knowledge Bases backed by Amazon OpenSearch Serverless, alongside an S3 Data Lake for raw abstracts and research files.
3. **Cheminformatics Execution Sandbox**: A dedicated AWS ECS Fargate container bundled with Python and RDKit to safely execute and evaluate SMILES string properties.
4. **Governance & HITL Gate**: Amazon Cognito for user authentication, DynamoDB for immutable audit trails and system state history, and a Streamlit frontend hosted on AWS Amplify.

---

## Project File Tree

```text
nexusbio/
├── .env.example
├── README.md
├── requirements.txt
│
├── frontend/                             # [Point 4] Governance & HITL Gate (Streamlit on AWS Amplify)
│   ├── app.py
│   └── requirements.txt
│
├── lambda_orchestrator/                  # [Point 1] Foundation Models & Orchestration (AWS Lambda + Multi-Agent)
│   ├── handler.py
│   ├── requirements.txt
│   └── agents/
│       ├── __init__.py
│       ├── literature_miner.py           # Uses Bedrock & OpenSearch Serverless [2]
│       ├── pathway_synthesizer.py        # Uses Bedrock Claude 3.5 Sonnet
│       └── molecular_design.py           # Calls the Cheminformatics Sandbox [3]
│
├── cheminformatics_sandbox/              # [Point 3] Cheminformatics Execution Sandbox (ECS Fargate + RDKit Container)
│   ├── Dockerfile                        # Mandatory here for compiled C++ / RDKit binaries
│   ├── main.py                           # FastAPI wrapper for SMILES evaluation
│   ├── requirements.txt
│   └── utils/
│       └── descriptors.py
│
├── knowledge_base/                       # [Point 2] Data & Knowledge Layer (Mock literature chunks & PDFs)
│   ├── raw_documents/
│   └── processed_chunks/
│
└── infrastructure/                       # AWS CDK (TypeScript) provisioning Points 1 through 4
    ├── bin/
    │   └── nexusbio.ts                   # CDK application entry point
    └── lib/
        ├── networking_stack.ts           # VPC, Subnets & Internal routing for Lambda-to-Sandbox communication
        ├── storage_stack.ts              # S3 Data Lake, DynamoDB Audit Trail , OpenSearch Serverless
        └── compute_stack.ts              # Lambda Orchestrator & ECS Fargate Sandbox Service

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
