from ast import Call
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.responses import RedirectResponse  # Add this import
from models import CallStatus, ClientCall, ClientMeeting, CompanyInfo, EmployeeInfo, EmployeeSalary, LeadStage, LeadStatus, LeadType, MeetingStatus, ModuleFeatures, Modules, UserInfo, UserRoleMapping, UserRolePermissions, UserRoles, Lead
from database import get_db
from pydantic import BaseModel

router = APIRouter()


# Login Route

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserInfo).filter(UserInfo.username == login_request.username).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if login_request.password != user.password_hash:
        raise HTTPException(status_code=401, detail="Incorrect password")

    role_mappings = db.query(UserRoleMapping).filter(UserRoleMapping.user_id == user.id).all()
    
    module_ids = [db.query(UserRoles).filter(UserRoles.id == rm.role_id).first().module_id for rm in role_mappings]
    
    if not module_ids:
        raise HTTPException(status_code=403, detail="No modules found for the user")

    return {"message": f"Welcome, {login_request.username}", "module_id": module_ids, "user_id": user.id}


# getting all the users
@router.get("/users/")
async def get_users(db: Session = Depends(get_db)):
    users = db.query(UserInfo).all()
    
    if not users:
        print("No users found in the database.")
        
    return users


# getting all modules
@router.get("/modules/")
async def get_modules(db: Session = Depends(get_db)):
    modules = db.query(Modules).all()
    
    if not modules:
        raise HTTPException(status_code=404, detail="No modules found")
    
    return modules       


# getting users with module id = moduleId
@router.get("/users/{moduleId}")
async def get_users(moduleId: int, db: Session = Depends(get_db)):
    roles = db.query(UserRoles).filter(UserRoles.module_id == moduleId).all()

    if not roles:
        raise HTTPException(status_code=404, detail="No roles found for this module")
    
    user_ids = []
    for role in roles:
        user_role_mappings = db.query(UserRoleMapping).filter(UserRoleMapping.role_id == role.id).all()
        user_ids.extend(mapping.user_id for mapping in user_role_mappings) 

    users = [db.query(UserInfo).filter(UserInfo.id == user_id).first() for user_id in user_ids]

    return users


# getting the name of a user by id
@router.get("/user_name/{id}/")
async def get_user_name(id: int, db: Session = Depends(get_db)):
    user = db.query(UserInfo).filter(UserInfo.id == id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"name": user.first_name}



## REAL_ESTATE MODULE

# getting all leads
@router.get("/leads/")
async def get_leads(db: Session = Depends(get_db)):
    leads = db.query(Lead).all()
    if not leads:
        raise HTTPException(status_code=404, detail="No leads found")
    return leads


# getting a lead by lead_id
@router.get("/lead/{lead_id}")
async def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return lead


# getting all leads assigned to a user
@router.get("/leads/{user_id}")
async def get_leads(user_id: int, db: Session = Depends(get_db)):
    leads = db.query(Lead).filter(Lead.assigned_to == user_id).all()
    if not leads:
        raise HTTPException(status_code=404, detail="No leads found")
    return leads


# getting all the leads stages
@router.get("/lead_stages/")
async def get_lead_stages(db: Session = Depends(get_db)):
    lead_stages = db.query(LeadStage).all()
    return lead_stages


# getting all the leads statuses
@router.get("/lead_statuses/")
async def get_lead_statuses(db: Session = Depends(get_db)):
    lead_statuses = db.query(LeadStatus).all()
    return lead_statuses


# getting all the lead types
@router.get("/lead_types/")
async def get_lead_types(db: Session = Depends(get_db)):
    lead_types = db.query(LeadType).all()
    return lead_types


# getting the lead stage name by id
@router.get("/lead_stage_name/{id}/")
async def get_lead_stage_name(id: int, db: Session = Depends(get_db)):
    stage = db.query(LeadStage).filter(LeadStage.id == id).first()
    
    if not stage:
        raise HTTPException(status_code=404, detail="Lead stage not found")
    
    return {"name": stage.lead_stage}

# getting the lead status name by id
@router.get("/lead_status_name/{id}/")
async def get_lead_stage_name(id: int, db: Session = Depends(get_db)):
    status = db.query(LeadStatus).filter(LeadStatus.id == id).first()
    
    if not status:
        raise HTTPException(status_code=404, detail="Lead status not found")
    
    return {"name": status.lead_status}

# getting lead type name by id
@router.get("/lead_type_name/{id}/")
async def get_lead_type_name(id: int, db: Session = Depends(get_db)):
    status = db.query(LeadType).filter(LeadType.id == id).first()
    
    if not status:
        raise HTTPException(status_code=404, detail="Lead status not found")
    
    return {"name": status.lead_type}


# deleting a lead by id
@router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    # Find the lead by ID
    lead = db.query(Lead).filter(Lead.lead_id == lead_id).first() 
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Delete the lead
    db.delete(lead)
    db.commit()

    return {"detail": "Lead deleted successfully"}
      
    
# adding a lead
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
    lead: LeadCreate,  
    db: Session = Depends(get_db)
):

    existing_lead = db.query(Lead).filter(Lead.lead_phone == lead.lead_phone).first()
    if existing_lead:
        raise HTTPException(status_code=400, detail="Lead with this phone already exists")

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


#updating a lead
@router.put("/editlead/{lead_id}/")
def update_lead(
    lead_id: int,
    lead: LeadCreate,
    db: Session = Depends(get_db)
):
    existing_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not existing_lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    existing_lead.company_domain = lead.company_domain
    existing_lead.lead_phone = lead.lead_phone
    existing_lead.name = lead.name
    existing_lead.email = lead.email
    existing_lead.job_title = lead.job_title
    existing_lead.assigned_to = lead.assigned_to
    existing_lead.lead_type = lead.lead_type
    existing_lead.lead_status = lead.lead_status
    existing_lead.lead_stage = lead.lead_stage
    existing_lead.gender = lead.gender

    db.commit()
    db.refresh(existing_lead)
    return existing_lead


# getting all company domains
@router.get("/company_domain/")
async def get_company_domain(db: Session = Depends(get_db)):
    company_domain = db.query(CompanyInfo).all()
    return company_domain


# getting the name of the assigne to user
@router.get("/assigned_to_name/{id}/")
async def get_assigned_to_name(id: int, db: Session = Depends(get_db)):
    user = db.query(UserInfo).filter(UserInfo.id == id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"name": user.username}


# getting the meetings of a lead
@router.get("/meetings/{lead_id}")
async def get_meetings(lead_id: int, db: Session = Depends(get_db)):
    meetings = db.query(ClientMeeting).filter(ClientMeeting.lead_id == lead_id).all()
    
    if not meetings:
        raise HTTPException(status_code=404, detail="No meetings found for this lead ID")

    return meetings


# getting the calls of a lead
@router.get("/calls/{lead_id}")
async def get_meetings(lead_id: int, db: Session = Depends(get_db)):
    calls = db.query(ClientCall).filter(ClientCall.lead_id == lead_id).all()
    
    if not calls:
        raise HTTPException(status_code=404, detail="No meetings found for this lead ID")

    return calls


# @router.get("/call_assigned_to_name/{lead_id}")
# async def get_call_assigned_to_name(lead_id: int, db: Session = Depends(get_db)):
#     calls = db.query(ClientCall).filter(ClientCall.lead_id == lead_id).all()

#     if not calls:
#         raise HTTPException(status_code=404, detail="No calls found for this lead ID")
    
#     user_ids = [call.assigned_to for call in calls]
#     users = [db.query(UserInfo).filter(UserInfo.id == user_id).first() for user_id in user_ids]
#     return users




# getting all calls statuses   
@router.get("/calls_status/")
async def get_calls_status(db: Session = Depends(get_db)):
    statuses = db.query(CallStatus).all()

    if not statuses:
        print("No call statuses found in the database.")
        
    return statuses


# getting all meating statuses
@router.get("/meeting_status/")
async def get_meeting_status(db: Session = Depends(get_db)):
    # Fetch all call statuses from the database
    statuses = db.query(MeetingStatus).all()
    #print(statuses)

    if not statuses:
        print("No call statuses found in the database.")
        
    return statuses


# getting all roles related to a user
@router.get("/user_roles/{user_id}")
async def get_user_roles(user_id: int, db: Session = Depends(get_db)):
    roles = db.query(UserRoleMapping).filter(UserRoleMapping.user_id == user_id).all()
    
    if not roles:
        raise HTTPException(status_code=404, detail="No roles found for this user ID")
    
    return roles


# getting all modules features
@router.get("/module_features/")
async def get_module_features(db: Session = Depends(get_db)):
    features = db.query(ModuleFeatures).all()
    
    if not features:
        raise HTTPException(status_code=404, detail="No features found")
    
    return features


# getting user permissions and the edit and delete permission are checked in the front-end part in RealEstate.js
@router.get("/user_permissions/{user_id}/{moduleId}/{featureId}")
async def get_user_permissions(user_id: int, moduleId: int, featureId: int,db: Session = Depends(get_db)):
    role_mappings = db.query(UserRoleMapping).filter(UserRoleMapping.user_id == user_id).all()

    if not role_mappings:
        raise HTTPException(status_code=404, detail="No roles found for this user ID")
    
    permissions = []
    for mapping in role_mappings:
        role_id = mapping.role_id  # Extract role_id
        role_permissions = db.query(UserRolePermissions).filter(
            UserRolePermissions.role_id == role_id,
            UserRolePermissions.module_id == moduleId,
            UserRolePermissions.feature_id == featureId
        ).all()
        
        permissions.extend(role_permissions)  # Add permissions to the list
    
    if not permissions:
        raise HTTPException(status_code=404, detail="No permissions found for this user in the specified module")
    
    return permissions


# adding a call
class CallCreate(BaseModel):
    company_domain: str
    call_date: datetime   
    lead_id: int
    assigned_to: int
    call_status: int

    class Config:
        pass

@router.post("/calls/")
def create_call(
    call: CallCreate,  
    db: Session = Depends(get_db)
):
    existing_call = db.query(ClientCall).filter(
        ClientCall.call_date == call.call_date  
    ).first()
    
    if existing_call:
        raise HTTPException(status_code=400, detail="Call for this lead and date already exists")

    new_call = ClientCall(
        company_domain=call.company_domain,
        call_date=call.call_date, 
        lead_id=call.lead_id,
        assigned_to=call.assigned_to,
        call_status=call.call_status,
    )
    
    db.add(new_call)
    db.commit()
    db.refresh(new_call)  

    return new_call   


# adding a meeting
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




## HR MODULE


# getting all employees
@router.get("/employees/")
async def get_employees(db: Session = Depends(get_db)):
    employees = db.query(EmployeeInfo).all()
    
    if not employees:
        print("No employees found in the database.")
        
    return employees


# getting the salary based on its primary key
@router.get("/salary/{company_domain}/{employeeId}/{due_year}/{due_month}/")
async def get_salary(company_domain: str, employeeId: int, due_year: int, due_month: int, db: Session = Depends(get_db)):
    salary = db.query(EmployeeSalary).filter(
        EmployeeSalary.company_domain == company_domain,
        EmployeeSalary.employee_id == employeeId,
        EmployeeSalary.due_year == due_year,
        EmployeeSalary.due_month == due_month
    ).first()

    if not salary:
        raise HTTPException(status_code=404, detail="Salary not found")

    return salary



# getting all salaries of an employee
@router.get("/salaries/{employee_id}")
async def get_salaries(employee_id: int, db: Session = Depends(get_db)):
    salaries = db.query(EmployeeSalary).filter(EmployeeSalary.employee_id == employee_id).all()
    
    if not salaries:
        raise HTTPException(status_code=404, detail="No salaries found for this employee ID")

    return salaries


# deleting an employee
@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: int, db: Session = Depends(get_db)):

    employee = db.query(EmployeeInfo).filter(EmployeeInfo.employee_id == employee_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db.delete(employee)
    db.commit()


# adding an employee
class EmployeeCreate(BaseModel):
        company_domain: str
        contact_name: str
        business_phone: str
        personal_phone: str
        business_email: str
        personal_email: str
        gender: str
        is_company_admin: bool

@router.post("/employee/")
def craete_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db)
):
    
    existing_employee = db.query(EmployeeInfo).filter(EmployeeInfo.business_phone == employee.business_phone).first()

    if existing_employee:
        raise HTTPException(status_code=400, detail="Employee with this business phone already exists")

    new_employee = EmployeeInfo(
        company_domain = employee.company_domain,
        contact_name = employee.contact_name,
        business_phone = employee.business_phone,
        personal_phone = employee.personal_phone,
        business_email = employee.business_email,
        personal_email = employee.personal_email,
        gender = employee.gender,
        is_company_admin = employee.is_company_admin
    )
    
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee) 
    return new_employee


# getting all the company domains of an employee by employee_id
@router.get("/employees_company_domain/{employeeId}")
async def get_employees_company_domains(employeeId: int, db: Session = Depends(get_db)):
    employees = db.query(EmployeeInfo).filter(EmployeeInfo.employee_id == employeeId).all()

    if not employees:
        raise HTTPException(status_code=404, detail="No employees found")
    return employees



# adding a salary
class EmployeeSalaryCreate(BaseModel):
    company_domain: str
    employee_id: int
    gross_salary: float  
    insurance: float
    taxes: float
    net_salary: float
    due_year: int
    due_month: int
    due_date: datetime 

@router.post("/salary/")
def create_employee_salary(
    salary: EmployeeSalaryCreate,
    db: Session = Depends(get_db)
):
    existing_employee = db.query(EmployeeInfo).filter(
        EmployeeInfo.company_domain == salary.company_domain,
        EmployeeInfo.employee_id == salary.employee_id
    ).first()

    if not existing_employee:
        raise HTTPException(status_code=400, detail="Employee does not exist")

    new_salary = EmployeeSalary(
        company_domain=salary.company_domain,
        employee_id=salary.employee_id,
        gross_salary=salary.gross_salary,
        insurance=salary.insurance,
        taxes=salary.taxes,
        net_salary=salary.net_salary,
        due_year=salary.due_year,
        due_month=salary.due_month,
        due_date=salary.due_date
    )

    db.add(new_salary)
    db.commit()
    db.refresh(new_salary)  # This will retrieve the new salary ID and other fields
    return new_salary


# updating a salary
@router.put("/edit_salary/{company_domain}/{employeeId}/{due_year}/{due_month}/")
def update_employee_salary(
    company_domain: str,
    employeeId: int,
    due_year: int,
    due_month: int,
    salary: EmployeeSalaryCreate,
    db: Session = Depends(get_db)
):
    existing_salary = db.query(EmployeeSalary).filter(
        EmployeeSalary.company_domain == company_domain,
        EmployeeSalary.employee_id == employeeId,
        EmployeeSalary.due_year == due_year,
        EmployeeSalary.due_month == due_month
    ).first()


    if not existing_salary:
        raise HTTPException(status_code=404, detail="Salary record not found")


    existing_salary.company_domain = salary.company_domain
    existing_salary.employee_id = salary.employee_id
    existing_salary.gross_salary = salary.gross_salary
    existing_salary.insurance = salary.insurance
    existing_salary.taxes = salary.taxes
    existing_salary.net_salary = salary.net_salary
    existing_salary.due_year = salary.due_year
    existing_salary.due_month = salary.due_month
    existing_salary.due_date = salary.due_date

    db.commit()
    db.refresh(existing_salary)  # Refresh the instance to get the updated fields
    return existing_salary


# getting an employee by employee_id
@router.get("/employee/{employee_id}")
async def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(EmployeeInfo).filter(EmployeeInfo.employee_id == employee_id).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return employee


# updating an employee
@router.put("/edit_employee/{employee_id}/")
def update_employee(
    employee_id: int,
    employee: EmployeeCreate,
    db: Session = Depends(get_db)
):
    existing_employee = db.query(EmployeeInfo).filter(EmployeeInfo.employee_id == employee_id).first()
    if not existing_employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing_employee.company_domain = employee.company_domain
    existing_employee.contact_name = employee.contact_name
    existing_employee.business_phone = employee.business_phone
    existing_employee.personal_phone = employee.personal_phone
    existing_employee.business_email = employee.business_email
    existing_employee.personal_email = employee.personal_email
    existing_employee.gender = employee.gender
    existing_employee.is_company_admin = employee.is_company_admin

    db.commit()
    db.refresh(existing_employee)
    return existing_employee


