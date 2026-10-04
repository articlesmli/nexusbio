import operator
from typing import Annotated, List, TypedDict
from pydantic import BaseModel, Field

class TargetExtraction(BaseModel):
    target_name: str = Field(description="The name of the validated biological target")
    associated_disease: str = Field(description="The targeted disease state")
    confidence_score: float = Field(description="Confidence score between 0.0 and 1.0")
    source_reference: str = Field(description="Mock source file or citation")

class MoleculeDesign(BaseModel):
    smiles_string: str = Field(description="Chemical structure in SMILES format")
    molecular_weight: float = Field(description="Calculated molecular weight")
    synthetic_accessibility_score: float = Field(description="Score from 1 (easy) to 10 (hard)")

class DiscoveryState(TypedDict):
    raw_document: str
    source_filename: str
    extracted_target: TargetExtraction | None
    pathway_approved: bool
    pathway_reasoning: str
    proposed_molecule: MoleculeDesign | None
    messages: Annotated[List[str], operator.add]
