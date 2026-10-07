import os
import json
import uuid
import boto3
from datetime import datetime
from agents.literature_miner import search_biomedical_literature
from agents.molecular_design import evaluate_compound_smiles

dynamodb = boto3.resource('dynamodb')
AUDIT_TABLE_NAME = os.getenv("AUDIT_TABLE_NAME", "NexusBioAuditTrail")
table = dynamodb.Table(AUDIT_TABLE_NAME)

def lambda_handler(event, context):
    """
    Main Lambda entrypoint for the multi-agent orchestrator loop.
    """
    session_id = event.get("session_id", f"sess_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}")
    query = event.get("query", "COX-2 selective inhibitors in multi-omics datasets")
    
    print(f"Starting orchestration session {session_id} for query: '{query}'")
    
    try:
        # Step 1: Literature Miner Agent (Bedrock + OpenSearch Knowledge Bases)
        lit_results = search_biomedical_literature(query)
        _log_audit(session_id, "Literature Miner", f"Retrieved {len(lit_results)} literature chunks.")

        # Step 2: Molecular Design Agent (Generates and calls sandbox for SMILES validation)
        candidate_smiles = "CC(=O)OC1=CC=CC=C1C(=O)O" 
        sandbox_response = evaluate_compound_smiles(session_id, "CMP-001", candidate_smiles)
        _log_audit(session_id, "Molecular Design", f"Evaluated SMILES via ECS Sandbox. QED: {sandbox_response.get('metrics', {}).get('qed')}")

        return {
            "statusCode": 200,
            "session_id": session_id,
            "status": "Success",
            "literature_chunks_count": len(lit_results),
            "molecular_evaluation": sandbox_response
        }

    except Exception as e:
        print(f"Error in orchestration loop: {str(e)}")
        _log_audit(session_id, "Orchestrator Error", str(e))
        return {
            "statusCode": 500,
            "session_id": session_id,
            "error": str(e)
        }

def _log_audit(session_id: str, agent: str, action: str):
    """Writes an immutable entry to the DynamoDB audit trail with a unique primary key."""
    timestamp = datetime.utcnow().isoformat()
    audit_id = f"{session_id}#{timestamp}#{str(uuid.uuid4())[:8]}"
    
    table.put_item(
        Item={
            "id": audit_id,
            "session_id": session_id,
            "timestamp": timestamp,
            "agent": agent,
            "action": action
        }
    )