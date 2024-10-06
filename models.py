from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint, CheckConstraint, Boolean, ForeignKeyConstraint
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship
from database import Base
import datetime
from sqlalchemy.sql import func
from sqlalchemy.types import TypeDecorator, Numeric
from decimal import Decimal

class Money(TypeDecorator):
    impl = Numeric(precision=19, scale=4)  # Adjust precision and scale as needed

    def process_bind_param(self, value, dialect):
        if value is not None:
            return Decimal(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return Decimal(value)
        return value

class UserInfo(Base):
    __tablename__ = "user_info"

    id = Column(Integer, primary_key=True, index=True)
    date_added = Column(DateTime, default=datetime.datetime.now)
    uid = Column(UNIQUEIDENTIFIER, default="NEWID()")
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"))
    first_name = Column(String(50), nullable=False)
    middle_name = Column(String(50))
    last_name = Column(String(50), nullable=False)
    phone = Column(String(50), unique=True, nullable=True)
    email = Column(String(50), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(200))
    gender = Column(String(10), CheckConstraint("gender IN ('Male', 'Female')"))

    roles = relationship("UserRoleMapping", back_populates="user")
    leads = relationship("Lead", back_populates="assigned_to_user")

class UserRoles(Base):
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, index=True)
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"))
    module_id = Column(Integer, ForeignKey("modules.id"))
    name = Column(String(50), nullable=False)

    __table_args__ = (
        UniqueConstraint('company_domain', 'module_id', 'name'),
    )

    user_role_mapping = relationship("UserRoleMapping", back_populates="role")
    module = relationship("Modules", back_populates="user_roles")  # Add this line to link to Modules


class UserRoleMapping(Base):
    __tablename__ = "user_role_mapping"

    user_id = Column(Integer, ForeignKey("user_info.id"), primary_key=True)
    role_id = Column(Integer, ForeignKey("user_roles.id"), primary_key=True)

    user = relationship("UserInfo", back_populates="roles")
    role = relationship("UserRoles")

class Lead(Base):
    __tablename__ = "leads_info"

    lead_id = Column(Integer, primary_key=True, index=True)
    date_added = Column(DateTime, default=datetime.datetime.now)
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"), nullable=False)
    gender = Column(String(10))
    lead_phone = Column(String(50), unique=True, nullable=False)
    name = Column(String(50), nullable=True)
    email = Column(String(50), nullable=True)
    job_title = Column(String(100), nullable=True)
    assigned_to = Column(Integer, ForeignKey("user_info.id"), nullable=True)

    lead_stage = Column(Integer, nullable=False)
    lead_status = Column(Integer, nullable=False)
    lead_type = Column(Integer, nullable=False)

    __table_args__ = (
        ForeignKeyConstraint(
            ['company_domain', 'lead_stage'],
            ['leads_stage.company_domain', 'leads_stage.id']
        ),
        ForeignKeyConstraint(
            ['company_domain', 'lead_type'],
            ['leads_types.company_domain', 'leads_types.id']
        ),
        ForeignKeyConstraint(
            ['company_domain', 'lead_status'],
            ['leads_status.company_domain', 'leads_status.id']
        ),
    )

    assigned_to_user = relationship("UserInfo", back_populates="leads")
    stage = relationship("LeadStage", back_populates="leads", overlaps="leads,status")
    status = relationship("LeadStatus", back_populates="leads", overlaps="leads,stage")
    type = relationship("LeadType", back_populates="leads", overlaps="stage,status,leads")
    meetings = relationship('ClientMeeting', back_populates='lead', cascade='all, delete-orphan')
    calls = relationship('ClientCall', back_populates='lead', cascade='all, delete-orphan')

class LeadStage(Base):
    __tablename__ = "leads_stage"

    id = Column(Integer, primary_key=True)
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"), nullable=False)
    lead_stage = Column(String(50), nullable=False)
    date_added = Column(DateTime, default=datetime.datetime.now)
    is_assigned = Column(Boolean, default=False)
    is_not_assigned = Column(Boolean, default=False)
    is_action_taken = Column(Boolean, default=False)

    leads = relationship("Lead", back_populates="stage", overlaps="leads")

class CompanyInfo(Base):
    __tablename__ = "company_info"

    company_domain = Column(String(100), primary_key=True)
    name = Column(String(50), nullable=False)
    field = Column(String(100))
    address = Column(String(500))
    country = Column(String(100))
    telephone_number = Column(String(50), unique=True, nullable=False)
    date_added = Column(DateTime, default=datetime.datetime.now)   

class ClientMeeting(Base):
    __tablename__ = "client_meetings"

    meeting_id = Column(Integer, primary_key=True)
    date_added = Column(DateTime, default=datetime.datetime.now)
    assigned_to = Column(Integer, ForeignKey("user_info.id"))
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"))
    lead_id = Column(Integer, ForeignKey("leads_info.lead_id"))
    meeting_date = Column(DateTime)
    meeting_status= Column(Integer, ForeignKey("meetings_status.id"))  # Update to match the foreign key

    lead = relationship("Lead", back_populates="meetings")
    assigned_user = relationship("UserInfo")
    meeting_status_ref = relationship("MeetingStatus", back_populates="meetings")  


    
class MeetingStatus(Base):
    __tablename__ = "meetings_status"

    company_domain = Column(String(100), ForeignKey("company_info.company_domain"), primary_key=True)
    id = Column(Integer, primary_key=True)
    meeting_status = Column(String(50), nullable=False)
    date_added = Column(DateTime, default=datetime.datetime.now)

    meetings = relationship("ClientMeeting", back_populates="meeting_status_ref") 

class ClientCall(Base):
    __tablename__ = "client_calls"

    call_id = Column(Integer, primary_key=True)
    date_added = Column(DateTime, default=datetime.datetime.now)
    assigned_to = Column(Integer, ForeignKey("user_info.id"))
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"))
    lead_id = Column(Integer, ForeignKey("leads_info.lead_id"))
    call_date = Column(DateTime)
    call_status = Column(Integer, ForeignKey("calls_status.id")) 

    lead = relationship("Lead", back_populates="calls")
    assigned_user = relationship("UserInfo")
    call_status_ref = relationship("CallStatus", back_populates="calls")     

class CallStatus(Base):
    __tablename__ = "calls_status"

    company_domain = Column(String(100), ForeignKey("company_info.company_domain"), primary_key=True)
    id = Column(Integer, primary_key=True)
    call_status = Column(String(50), nullable=False)
    date_added = Column(DateTime, default=datetime.datetime.now)

    calls = relationship("ClientCall", back_populates="call_status_ref") 

class LeadStatus(Base):
    __tablename__ = "leads_status"

    id = Column(Integer, primary_key=True)
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"), nullable=False)
    lead_status = Column(String(50), nullable=False)
    date_added = Column(DateTime, default=datetime.datetime.now)

    leads = relationship("Lead", back_populates="status", overlaps="leads")

class LeadType(Base):
    __tablename__ = "leads_types"

    id = Column(Integer, primary_key=True)
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"), nullable=False)
    lead_type = Column(String(50), nullable=False)
    date_added = Column(DateTime, default=datetime.datetime.now)

    leads = relationship("Lead", back_populates="type", overlaps="leads")



class UserRolePermissions(Base):
    __tablename__ = "user_role_permissions"

    role_id = Column(Integer, ForeignKey("user_roles.id"), primary_key=True)
    permission_id = Column(Integer, primary_key=True, autoincrement=True)
    module_id = Column(Integer, nullable=False)
    feature_id = Column(Integer, nullable=False)

    d_read = Column(Boolean, default=False)
    d_write = Column(Boolean, default=False)
    d_edit = Column(Boolean, default=False)
    d_delete = Column(Boolean, default=False)

    role = relationship("UserRoles", backref="permissions") 
    module_feature = relationship("ModuleFeatures", backref="permissions")  

    __table_args__ = (
    ForeignKeyConstraint(
        ['role_id'],
        ['user_roles.id'],
        ondelete='CASCADE',
    ),
    ForeignKeyConstraint(
        ['module_id', 'feature_id'],
        ['module_features.module_id', 'module_features.feature_id'],
    ),
)    
    
class Modules(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    display_name = Column(String(100))
    description = Column(String) 
    available = Column(Boolean)
    comming_on = Column(DateTime) 
    color = Column(Integer)  
    url = Column(String)  

    user_roles = relationship("UserRoles", back_populates="module") 
    features = relationship("ModuleFeatures", back_populates="module_reference")  


class ModuleFeatures(Base):
    __tablename__ = "module_features"

    module_id = Column(Integer, ForeignKey("modules.id"), primary_key=True)
    feature_id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    display_name = Column(String(100), nullable=False)

    module_reference = relationship("Modules", back_populates="features")  
    __table_args__ = (
        UniqueConstraint('module_id', 'feature_id', 'name', name='UQ_module_features'),
    )

class EmployeeInfo(Base):
    __tablename__ = "employees_info"

    date_added = Column(DateTime, default=datetime.datetime.now)
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"), primary_key=True)
    employee_id = Column(Integer, primary_key=True, autoincrement=True)
    contact_name = Column(String(50), nullable=False)
    business_phone = Column(String(50))
    personal_phone = Column(String(50))
    business_email = Column(String(50))
    personal_email = Column(String(50))
    gender = Column(String(10))
    is_company_admin = Column(Boolean)
    user_uid = Column(String, default=func.newid())  
    salaries = relationship(
        "EmployeeSalary", 
        back_populates="employee",
        cascade="all, delete-orphan"  
    )

class EmployeeSalary(Base):
    __tablename__ = "employees_salaries"

    company_domain = Column(String(100), primary_key=True)
    employee_id = Column(Integer, primary_key=True)
    gross_salary = Column(Money)
    insurance = Column(Money)
    taxes = Column(Money)
    net_salary = Column(Money)
    due_year = Column(Integer, primary_key=True)
    due_month = Column(Integer, primary_key=True)
    date_added = Column(DateTime, default=datetime.datetime.now)
    due_date = Column(DateTime)

    __table_args__ = (
        ForeignKeyConstraint(
            ['company_domain', 'employee_id'],
            ['employees_info.company_domain', 'employees_info.employee_id'],
            ondelete='CASCADE',
        ),
    )

    employee = relationship("EmployeeInfo", back_populates="salaries") 