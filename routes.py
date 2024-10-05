from ast import Call
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.responses import RedirectResponse  # Add this import
from models import CallStatus, ClientCall, ClientMeeting, CompanyInfo, LeadStage, LeadStatus, LeadType, MeetingStatus, UserInfo, UserRoleMapping, UserRoles, Lead
from database import get_db
from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

# Password hashing utility
#pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# APIRouter instance
router = APIRouter()

# Utility to verify hashed passwords
#def verify_password(plain_password, hashed_password):
  #  return pwd_context.verify(plain_password, hashed_password)

 # Add Lead Route

@router.get("/users/")
async def get_users(db: Session = Depends(get_db)):
    # Fetch all users from the database
    users = db.query(UserInfo).all()
    #print(users)
    
    if not users:
        print("No users found in the database.")
        
    return users

@router.get("/calls_status/")
async def get_calls_status(db: Session = Depends(get_db)):
    # Fetch all call statuses from the database
    statuses = db.query(CallStatus).all()
    #print(statuses)

    if not statuses:
        print("No call statuses found in the database.")
        
    return statuses

@router.get("/meeting_status/")
async def get_meeting_status(db: Session = Depends(get_db)):
    # Fetch all call statuses from the database
    statuses = db.query(MeetingStatus).all()
    #print(statuses)

    if not statuses:
        print("No call statuses found in the database.")
        
    return statuses

@router.get("/lead_stages/")
async def get_lead_stages(db: Session = Depends(get_db)):
    lead_stages = db.query(LeadStage).all()
    return lead_stages

# Fetch available lead statuses
@router.get("/lead_statuses/")
async def get_lead_statuses(db: Session = Depends(get_db)):
    lead_statuses = db.query(LeadStatus).all()
    return lead_statuses

# Fetch available lead types
@router.get("/lead_types/")
async def get_lead_types(db: Session = Depends(get_db)):
    lead_types = db.query(LeadType).all()
    return lead_types

@router.get("/lead_stage_name/{id}/")
async def get_lead_stage_name(id: int, db: Session = Depends(get_db)):
    stage = db.query(LeadStage).filter(LeadStage.id == id).first()
    
    if not stage:
        raise HTTPException(status_code=404, detail="Lead stage not found")
    
    return {"name": stage.lead_stage}

@router.get("/lead_status_name/{id}/")
async def get_lead_stage_name(id: int, db: Session = Depends(get_db)):
    status = db.query(LeadStatus).filter(LeadStatus.id == id).first()
    
    if not status:
        raise HTTPException(status_code=404, detail="Lead status not found")
    
    return {"name": status.lead_status}

@router.get("/lead_type_name/{id}/")
async def get_lead_type_name(id: int, db: Session = Depends(get_db)):
    status = db.query(LeadType).filter(LeadType.id == id).first()
    
    if not status:
        raise HTTPException(status_code=404, detail="Lead status not found")
    
    return {"name": status.lead_type}

@router.get("/assigned_to_name/{id}/")
async def get_assigned_to_name(id: int, db: Session = Depends(get_db)):
    user = db.query(UserInfo).filter(UserInfo.id == id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"name": user.username}

@router.get("/meetings/{lead_id}")
async def get_meetings(lead_id: int, db: Session = Depends(get_db)):
    meetings = db.query(ClientMeeting).filter(ClientMeeting.lead_id == lead_id).all()
    
    if not meetings:
        raise HTTPException(status_code=404, detail="No meetings found for this lead ID")

    return meetings

@router.get("/call_assigned_to_name/{lead_id}")
async def get_call_assigned_to_name(lead_id: int, db: Session = Depends(get_db)):
    calls = db.query(ClientCall).filter(ClientCall.lead_id == lead_id).all()

    if not calls:
        raise HTTPException(status_code=404, detail="No calls found for this lead ID")
    
    user_ids = [call.assigned_to for call in calls]

    


@router.get("/calls/{lead_id}")
async def get_meetings(lead_id: int, db: Session = Depends(get_db)):
    calls = db.query(ClientCall).filter(ClientCall.lead_id == lead_id).all()
    
    if not calls:
        raise HTTPException(status_code=404, detail="No meetings found for this lead ID")

    return calls

@router.get("/leads/")
async def get_leads(db: Session = Depends(get_db)):
    leads = db.query(Lead).all()
    if not leads:
        raise HTTPException(status_code=404, detail="No leads found")
    return leads
    
# @router.get("/leads/filter/")
# async def get_filtered_leads(assigned_to: Optional[int] = None, db: Session = Depends(get_db)):
#     query = db.query(Lead)
    
#     if assigned_to is not None:
#         query = query.filter(Lead.assigned_to == assigned_to)
        
#     leads = query.all()
    
#     if not leads:
#         raise HTTPException(status_code=404, detail="No leads found")
    
#     return leads    

@router.get("/company_domain/")
async def get_company_domain(db: Session = Depends(get_db)):
    company_domain = db.query(CompanyInfo).all()
    return company_domain

class LeadCreate(BaseModel):
    company_domain: str
    lead_phone: str
    name: str = None
    email: str = None
    job_title: str = None
    assigned_to: int
    lead_stage: int
    lead_status: int
    lead_type: int
    gender: str

@router.post("/leads/")
def create_lead(
    lead: LeadCreate,  # Use the Pydantic model here
    db: Session = Depends(get_db)
):
    # Check if lead already exists
    existing_lead = db.query(Lead).filter(Lead.lead_phone == lead.lead_phone).first()
    if existing_lead:
        raise HTTPException(status_code=400, detail="Lead with this phone already exists")

    #print("Received lead data:", lead)

    new_lead = Lead(
        company_domain=lead.company_domain,
        lead_phone=lead.lead_phone,
        name=lead.name,
        email=lead.email,
        job_title=lead.job_title,
        assigned_to=lead.assigned_to,
        lead_type=lead.lead_type,           
        lead_status=lead.lead_status,       
        lead_stage=lead.lead_stage,
        gender=lead.gender  
    )
    
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)  # This will retrieve the lead_id and other fields
    return new_lead

class CallCreate(BaseModel):
    company_domain: str
    call_date: datetime    # Consider using datetime if you want to validate the format
    lead_id: int
    assigned_to: int
    call_status: int

    class Config:
        # Remove arbitrary_types_allowed = True
        pass

@router.post("/calls/")
def create_call(
    call: CallCreate,  # Use the Pydantic model here
    db: Session = Depends(get_db)
):
    # Check if a call already exists for the given lead ID and date
    existing_call = db.query(ClientCall).filter(
        ClientCall.call_date == call.call_date  # Ensure this is formatted correctly in the database
    ).first()
    
    if existing_call:
        raise HTTPException(status_code=400, detail="Call for this lead and date already exists")

    #print("Received call data:", call)

    new_call = ClientCall(
        company_domain=call.company_domain,
        call_date=call.call_date,  # Make sure this is formatted correctly
        lead_id=call.lead_id,
        assigned_to=call.assigned_to,
        call_status=call.call_status,
    )
    
    db.add(new_call)
    db.commit()
    db.refresh(new_call)  # This will retrieve any autogenerated fields like call_id

    return new_call   

class MeetingCreate(BaseModel):
    company_domain: str
    meeting_date: datetime
    lead_id: int
    assigned_to: int
    meeting_status: int

@router.post("/meetings/")
def create_meeting(
    meeting: MeetingCreate,
    db: Session = Depends(get_db)
):
    new_meeting = ClientMeeting(
        company_domain=meeting.company_domain,
        meeting_date=meeting.meeting_date,
        lead_id=meeting.lead_id,
        assigned_to=meeting.assigned_to,
        meeting_status=meeting.meeting_status,
    )

    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)

    return new_meeting

# Login route
@router.post("/login")
def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserInfo).filter(UserInfo.username == login_request.username).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Assuming plain password check here; adjust for hashed passwords
    if login_request.password != user.password_hash:
        raise HTTPException(status_code=401, detail="Incorrect password")

    # Fetch user roles and module IDs as before
    role_mappings = db.query(UserRoleMapping).filter(UserRoleMapping.user_id == user.id).all()
    
    module_ids = [db.query(UserRoles).filter(UserRoles.id == rm.role_id).first().module_id for rm in role_mappings]
    
    if not module_ids:
        raise HTTPException(status_code=403, detail="No modules found for the user")

    # Returning module IDs
    return {"message": f"Welcome, {login_request.username}", "module_id": module_ids, "user_id": user.id}  # Return the first module ID for simplicity



