import sys
import os

# Add orchestrator path
sys.path.append(os.path.abspath("./lambda_orchestrator"))
from agents.pathway_synthesizer import synthesize_biological_pathway
from agents.molecular_design import evaluate_compound_smiles

# Test Llama 3 Pathway Synthesis
print("Testing Llama 3 Bedrock Integration...")
mock_chunks = [{"content": {"text": "Target COX-2 shows high affinity for salicylic derivatives."}}]
result = synthesize_biological_pathway("COX-2 inhibitors", mock_chunks)
print("Pathway Synthesis Result:", result)

# Test Sandbox Connection
print("Testing Sandbox Client...")
sandbox_res = evaluate_compound_smiles("sess_test", "CMP-01", "CC(=O)OC1=CC=CC=C1C(=O)O")
print("Sandbox Result:", sandbox_res)
