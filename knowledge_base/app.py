import os
import glob
import streamlit as st
from discovery_network import app

# --- PAGE CONFIG ---
st.set_page_config(page_title="HelixLoop AI | Discovery R&D", layout="wide")

st.title("helixloop ai")
st.subheader("Autonomous Multi-Agent Target Discovery & Synthesis Network")

# ==========================================
# Streamlit Sidebar & Document Selector
# ==========================================
st.sidebar.header("Research Corpus Ingestion")
docs_folder = "mock_dock"

if not os.path.exists(docs_folder):
    os.makedirs(docs_folder, exist_ok=True)

files = glob.glob(os.path.join(docs_folder, "*.txt"))
selected_file = st.sidebar.selectbox("Select Research Document:", files if files else ["No files found"])

if st.sidebar.button("Run Agentic Discovery Loop"):
    if not files:
        st.error("Please add text files to your mock_dock folder!")
    else:
        with open(selected_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        initial_state = {
            "raw_document": content,
            "source_filename": os.path.basename(selected_file),
            "extracted_target": None,
            "pathway_approved": False,
            "pathway_reasoning": "",
            "proposed_molecule": None,
            "messages": []
        }
        
        with st.spinner("Agents collaborating... (Mining -> Synthesizing -> Designing)"):
            final_state = app.invoke(initial_state)
            
        st.session_state["final_state"] = final_state

# ==========================================
# Main Dashboard Display
# ==========================================
if "final_state" in st.session_state:
    state = st.session_state["final_state"]
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### Agent Execution Trace")
        for m in state["messages"]:
            st.info(m)
            
    with col2:
        st.markdown("### Governance & Pipeline State")
        target = state["extracted_target"]
        if target:
            st.metric("Target Confidence Score", f"{target.confidence_score * 100:.0f}%")
            st.write(f"**Target:** {target.target_name}")
            st.write(f"**Disease Indication:** {target.associated_disease}")
            
        if state["pathway_approved"]:
            st.success(f"**Pathway Status:** APPROVED\n\n{state['pathway_reasoning']}")
        else:
            st.error(f"**Pathway Status:** REJECTED / HALTED\n\n{state['pathway_reasoning']}")

    # HITL Review Gate
    if state.get("proposed_molecule"):
        st.markdown("---")
        st.subheader("Human-in-the-Loop (HITL) Scientist Review Gate")
        mol = state["proposed_molecule"]
        
        m_col1, m_col2, m_col3 = st.columns(3)
        m_col1.metric("Molecular Weight", f"{mol.molecular_weight} g/mol")
        m_col2.metric("Synthetic Accessibility", f"{mol.synthetic_accessibility_score}/10")
        m_col3.text_input("Proposed SMILES", mol.smiles_string)
        
        if st.button("Approve for Wet-Lab Synthesis Handoff"):
            st.success("Compound successfully approved and logged to immutable audit trail! Handoff sent to synthesis lab.")