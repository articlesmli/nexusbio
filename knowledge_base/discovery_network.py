import os
import glob
from langgraph.graph import StateGraph, START, END
from schemas import DiscoveryState
from agents import (
    literature_miner_node,
    pathway_synthesizer_node,
    molecular_design_node,
    check_pathway_approval
)

# Build and Compile StateGraph
workflow = StateGraph(DiscoveryState)

workflow.add_node("literature_miner", literature_miner_node)
workflow.add_node("pathway_synthesizer", pathway_synthesizer_node)
workflow.add_node("molecular_design", molecular_design_node)

workflow.add_edge(START, "literature_miner")
workflow.add_edge("literature_miner", "pathway_synthesizer")
workflow.add_conditional_edges(
    "pathway_synthesizer",
    check_pathway_approval,
    {
        "proceed_to_design": "molecular_design",
        "stop_workflow": END
    }
)
workflow.add_edge("molecular_design", END)

app = workflow.compile()

def run_ingestion_pipeline(docs_directory: str):
    print(f"=== Starting HelixLoop AI Ingestion from ./{docs_directory} ===")
    
    search_path = os.path.join(docs_directory, "*.txt")
    files = glob.glob(search_path)
    
    if not files:
        print(f"No text files found in ./{docs_directory}. Please add a mock text file!")
        return

    for file_path in files:
        filename = os.path.basename(file_path)
        with open(file_path, "r", encoding="utf-8") as f:
            file_content = f.read()
            
        initial_state = {
            "raw_document": file_content,
            "source_filename": filename,
            "extracted_target": None,
            "pathway_approved": False,
            "pathway_reasoning": "",
            "proposed_molecule": None,
            "messages": []
        }
        
        print(f"\n[Ingest] Ingesting document: {filename}")
        final_state = app.invoke(initial_state)
        
        print("\n--- EXECUTION AUDIT TRAIL ---")
        for m in final_state["messages"]:
            print(f" -> {m}")
            
        if final_state.get("proposed_molecule"):
            print("\n[HITL Gate Ready] Proposed Molecule for Scientist Review:")
            print(f"SMILES: {final_state['proposed_molecule'].smiles_string}")
            print(f"Molecular Weight: {final_state['proposed_molecule'].molecular_weight}")
            print(f"Synthetic Accessibility: {final_state['proposed_molecule'].synthetic_accessibility_score}/10")
        print("=" * 50)

if __name__ == "__main__":
    os.makedirs("mock_dock", exist_ok=True)
    run_ingestion_pipeline("mock_dock")