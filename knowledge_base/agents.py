from schemas import TargetExtraction, MoleculeDesign, DiscoveryState

def literature_miner_node(state: DiscoveryState):
    """Agent 1: Ingests raw text and extracts structured target insights."""
    print(f"\n--- [Literature Miner Agent] Processing file: {state['source_filename']} ---")
    doc = state["raw_document"]
    
    if "Fibrosis" in doc and "Target-X" in doc:
        target = TargetExtraction(
            target_name="Target-X",
            associated_disease="Idiopathic Pulmonary Fibrosis",
            confidence_score=0.91,
            source_reference=state["source_filename"]
        )
        msg = f"Extracted target {target.target_name} from {state['source_filename']} with score {target.confidence_score}."
    else:
        target = TargetExtraction(
            target_name="Target-Y (Low Confidence)",
            associated_disease="Inflammation",
            confidence_score=0.45,
            source_reference=state["source_filename"]
        )
        msg = f"Extracted target from {state['source_filename']} with low confidence score."
        
    return {
        "extracted_target": target,
        "messages": [msg]
    }

def pathway_synthesizer_node(state: DiscoveryState):
    """Agent 2: Evaluates biological plausibility and pathway toxicity risks."""
    print("--- [Pathway Synthesizer Agent] Evaluating mechanism... ---")
    target = state["extracted_target"]
    
    if target and target.confidence_score > 0.8:
        approved = True
        reasoning = f"Target {target.target_name} shows clean down-stream signaling without toxicity flags."
        msg = f"Pathway Approved: {reasoning}"
    else:
        approved = False
        reasoning = "Target failed confidence threshold or presented high off-target risks."
        msg = f"Pathway Rejected: {reasoning}"
        
    return {
        "pathway_approved": approved,
        "pathway_reasoning": reasoning,
        "messages": [msg]
    }

def molecular_design_node(state: DiscoveryState):
    """Agent 3: Generates small molecule candidates meeting synthetic rules."""
    print("--- [Molecular Design Agent] Designing chemical space... ---")
    
    molecule = MoleculeDesign(
        smiles_string="CC1=CC=C(C=C1)NC(=O)CSC2=NC=CC=C2N",
        molecular_weight=334.4,
        synthetic_accessibility_score=2.2
    )
    msg = f"Generated candidate structure with SMILES: {molecule.smiles_string}"
    
    return {
        "proposed_molecule": molecule,
        "messages": [msg]
    }

def check_pathway_approval(state: DiscoveryState):
    if state.get("pathway_approved"):
        return "proceed_to_design"
    return "stop_workflow"
