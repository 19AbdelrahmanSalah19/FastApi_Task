from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint, CheckConstraint, Boolean
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship
from database import Base
import datetime

# UserInfo model (representing user_info table)
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

    # Relationships
    roles = relationship("UserRoleMapping", back_populates="user")
    leads = relationship("Lead", back_populates="assigned_to_user")

# UserRoles model (representing user_roles table)
class UserRoles(Base):
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, index=True)
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"))
    module_id = Column(Integer, ForeignKey("modules.id"))
    name = Column(String(50), nullable=False)

    __table_args__ = (
        UniqueConstraint('company_domain', 'module_id', 'name'),
    )

    # Relationships
    user_role_mapping = relationship("UserRoleMapping", back_populates="role")

# UserRoleMapping model (representing user_role_mapping table)
class UserRoleMapping(Base):
    __tablename__ = "user_role_mapping"

    user_id = Column(Integer, ForeignKey("user_info.id"), primary_key=True)
    role_id = Column(Integer, ForeignKey("user_roles.id"), primary_key=True)

    # Relationships
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

    lead_stage = Column(Integer, ForeignKey("leads_stage.id"), nullable=False)
    lead_status = Column(Integer, ForeignKey("leads_status.id"), nullable=False)
    lead_type = Column(Integer, ForeignKey("leads_types.id"), nullable=False)

    # Relationships
    assigned_to_user = relationship("UserInfo", back_populates="leads")
    stage = relationship("LeadStage", back_populates="leads")
    status = relationship("LeadStatus", back_populates="leads")
    type = relationship("LeadType", back_populates="leads")
    meetings = relationship('ClientMeeting', back_populates='lead', cascade='all, delete-orphan')
    calls = relationship('ClientCall', back_populates='lead', cascade='all, delete-orphan')

# LeadStage Model
class LeadStage(Base):
    __tablename__ = "leads_stage"

    id = Column(Integer, primary_key=True)
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"), nullable=False)
    lead_stage = Column(String(50), nullable=False)
    date_added = Column(DateTime, default=datetime.datetime.now)
    is_assigned = Column(Boolean, default=False)
    is_not_assigned = Column(Boolean, default=False)
    is_action_taken = Column(Boolean, default=False)

    leads = relationship("Lead", back_populates="stage")

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

    # Relationships
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
    call_status = Column(Integer, ForeignKey("calls_status.id"))  # Change to reflect the foreign key correctly

    # Relationships
    lead = relationship("Lead", back_populates="calls")
    assigned_user = relationship("UserInfo")
    call_status_ref = relationship("CallStatus", back_populates="calls")     

# CallStatus Model
class CallStatus(Base):
    __tablename__ = "calls_status"

    company_domain = Column(String(100), ForeignKey("company_info.company_domain"), primary_key=True)
    id = Column(Integer, primary_key=True)
    call_status = Column(String(50), nullable=False)
    date_added = Column(DateTime, default=datetime.datetime.now)

    calls = relationship("ClientCall", back_populates="call_status_ref") 

# LeadStatus Model
class LeadStatus(Base):
    __tablename__ = "leads_status"

    id = Column(Integer, primary_key=True)
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"), nullable=False)
    lead_status = Column(String(50), nullable=False)
    date_added = Column(DateTime, default=datetime.datetime.now)

    leads = relationship("Lead", back_populates="status")

# LeadType Model
class LeadType(Base):
    __tablename__ = "leads_types"

    id = Column(Integer, primary_key=True)
    company_domain = Column(String(100), ForeignKey("company_info.company_domain"), nullable=False)
    lead_type = Column(String(50), nullable=False)
    date_added = Column(DateTime, default=datetime.datetime.now)

    leads = relationship("Lead", back_populates="type")