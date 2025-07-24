from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import asyncio
import httpx
from supabase import create_client, Client
import os
from datetime import datetime
import logging
from dotenv import load_dotenv
load_dotenv()
import uuid

# Import your existing damage assessor
from img import InfrastructureDamageAssessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Infrastructure Damage Assessment API", version="1.0.0")

SUPABASE_URL = os.getenv("SUPABASE_URL",)
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", )
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Initialize the damage assessor globally
assessor = None

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    global assessor
    logger.info("Initializing damage assessment model...")
    assessor = InfrastructureDamageAssessor()
    logger.info("Model initialized successfully!")

# Pydantic models
class IssueRequest(BaseModel):
    issue_id: str

class AssessmentResponse(BaseModel):
    success: bool
    message: str
    priority_score: Optional[int] = None
    error: Optional[str] = None

class IssueData(BaseModel):
    id: str
    title: str
    description: str
    image_urls: List[str]
    status: str
def validate_uuid(issue_id: str) -> Optional[str]:
    try:
        issue_uuid = str(uuid.UUID(issue_id))
        logger.info(f"✅ UUID is valid: {issue_uuid}")
        return issue_uuid
    except ValueError as e:
        logger.error(f"❌ Invalid UUID format: {e}")
        return None

async def fetch_issue_from_supabase(issue_id: str) -> Optional[IssueData]:
    """Fetch issue data from Supabase"""
    try:
        response = supabase.table('issues').select('*').eq('id', issue_id).execute()
        
        if not response.data:
            logger.error(f"No issue found with ID: {issue_id}")
            return None
            
        issue = response.data[0]
        return IssueData(
            id=issue['id'],
            title=issue['title'],
            description=issue['description'],
            image_urls=issue.get('image_urls', []),
            status=issue['status']
        )
        
    except Exception as e:
        logger.error(f"Error fetching issue {issue_id}: {str(e)}")
        return None

async def update_issue_priority(issue_id: str, priority_score: int, reasoning: str) -> bool:
    """Update issue priority score in Supabase"""
    try:
        response = supabase.table('issues').update({
            'priority_score': priority_score,
            'assessment_reasoning': reasoning,
            'status': 'Assessed',
            'assessed_at': datetime.utcnow().isoformat()
        }).eq('id', issue_id).execute()
        
        if response.data:
            logger.info(f"Successfully updated priority score for issue {issue_id}: {priority_score}")
            return True
        else:
            logger.error(f"Failed to update issue {issue_id}")
            return False
            
    except Exception as e:
        logger.error(f"Error updating issue {issue_id}: {str(e)}")
        return False

async def assess_issue_damage(issue: IssueData) -> Optional[dict]:
    """Assess damage for an issue using the AI model"""
    try:
        # Use the first image if available
        if not issue.image_urls:
            logger.warning(f"No images available for issue {issue.id}")
            return {
                "priority_score": 10,  # Default score
                "reasoning": "No images provided for assessment. Using default priority score."
            }
        
        # Get the first image URL
        image_url = issue.image_urls[0]
        
        # Call the damage assessor
        result = assessor.assess_damage(
            heading=issue.title,
            description=issue.description,
            image_source=image_url
        )
        
        logger.info(f"Assessment completed for issue {issue.id}: Score {result.get('priority_score', 0)}")
        return result
        
    except Exception as e:
        logger.error(f"Error assessing damage for issue {issue.id}: {str(e)}")
        return {
            "priority_score": 50,
            "reasoning": f"Assessment failed due to technical error: {str(e)}"
        }

async def process_issue_assessment(issue_id: str):
    """Background task to process issue assessment"""
    try:
        logger.info(f"Starting assessment for issue: {issue_id}")
        
        # Update status to 'Processing'
        supabase.table('issues').update({
            'status': 'Processing'
        }).eq('id', issue_id).execute()
        
        # Fetch issue data
        issue = await fetch_issue_from_supabase(issue_id)
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")
        
        # Assess the damage
        assessment_result = await assess_issue_damage(issue)
        
        if assessment_result:
            # Update the issue with priority score
            success = await update_issue_priority(
                issue_id=issue_id,
                priority_score=assessment_result.get('priority_score', 50),
                reasoning=assessment_result.get('reasoning', 'Assessment completed')
            )
            
            if success:
                logger.info(f"Successfully processed assessment for issue {issue_id}")
            else:
                logger.error(f"Failed to update database for issue {issue_id}")
        else:
            logger.error(f"Assessment failed for issue {issue_id}")
            
    except Exception as e:
        logger.error(f"Error in background assessment for issue {issue_id}: {str(e)}")
        # Update status to 'Error'
        try:
            supabase.table('issues').update({
                'status': 'Error',
                'assessment_reasoning': f"Assessment failed: {str(e)}"
            }).eq('id', issue_id).execute()
        except Exception as db_error:
            logger.error(f"Failed to update error status: {str(db_error)}")

@app.post("/assess-issue", response_model=AssessmentResponse)
async def assess_issue_endpoint(
    request: IssueRequest, 
    background_tasks: BackgroundTasks
):
    """Endpoint to queue an issue for assessment"""
    try:
        # Validate UUID format
        validated_id = validate_uuid(request.issue_id)
        if not validated_id:
            raise HTTPException(status_code=400, detail="Invalid UUID format")

        # Add the assessment task to background tasks
        background_tasks.add_task(process_issue_assessment, validated_id)
        
        logger.info(f"Queued assessment for issue: {validated_id}")
        
        return AssessmentResponse(
            success=True,
            message=f"Issue {validated_id} queued for assessment"
        )
        
    except Exception as e:
        logger.error(f"Error queuing assessment: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to queue assessment: {str(e)}"
        )


@app.get("/assessment-status/{issue_id}")
async def get_assessment_status(issue_id: str):
    """Get the current assessment status of an issue"""
    try:
        validated_id = validate_uuid(issue_id)
        if not validated_id:
            raise HTTPException(status_code=400, detail="Invalid UUID format")

        response = supabase.table('issues').select(
            'id, status, priority_score, assessment_reasoning, assessed_at'
        ).eq('id', validated_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Issue not found")
            
        issue = response.data[0]
        return {
            "issue_id": issue['id'],
            "status": issue['status'],
            "priority_score": issue.get('priority_score'),
            "reasoning": issue.get('assessment_reasoning'),
            "assessed_at": issue.get('assessed_at')
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching status for issue {issue_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch assessment status: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": assessor is not None,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Infrastructure Damage Assessment API",
        "version": "1.0.0",
        "endpoints": {
            "assess_issue": "POST /assess-issue",
            "assessment_status": "GET /assessment-status/{issue_id}",
            "health": "GET /health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )