import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const RealEstate = () => {
    const [leads, setLeads] = useState([]);
    const [expandedLeadId, setExpandedLeadId] = useState(null);
    const location = useLocation();
    const userId = location.state?.userId;
    const moduleId = location.state?.moduleId;
    const navigate = useNavigate();
    const [leadStageName, setLeadStageName] = useState({});
    const [leadStatusName, setLeadStatusName] = useState({});
    const [leadTypeName, setLeadTypeName] = useState({});
    const [meetings, setMeetings] = useState({});
    const [calls, setCalls] = useState({});
    const [callStatuses, setCallStatuses] = useState([]);
    const [meetingStatuses, setMeetingStatuses] = useState([]);
    const [deletePermissions, setDeletePermissions] = useState([]);
    const [editPermissions, setEditPermissions] = useState([]);
    const [userName, setUserName] = useState([]);
    const [loading, setLoading] = useState(true); // To track API call loading


    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/leads/${userId}/`);
                setLeads(response.data);
            } catch (error) {
                console.error("There was an error fetching the leads!", error);
            }
        }

        const fetchUserName = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/user_name/${userId}/`);
                setUserName(response.data.name);
            } catch (error) {
                console.error("There was an error fetching the leads!", error);
            }

        };


        const fetchCallStatuses = async () => {
            try {
                const response = await axios.get('http://localhost:8000/calls_status/');
                setCallStatuses(response.data);
            } catch (error) {
                console.error("Error fetching call statuses:", error);
            }
        };

        const fetchMeetingStatuses = async () => {
            try {
                const response = await axios.get('http://localhost:8000/meeting_status/');
                setMeetingStatuses(response.data);
            } catch (error) {
                console.error("Error fetching meeting statuses:", error);
            }
        };

        const fetchPermissions = async () => {
            try {
                setLoading(true);
                const featureResponse = await axios.get(`http://localhost:8000/module_features/`);
                const leadsFeature = featureResponse.data.find(feature => feature.name === "Leads");
                const leadsFeatureId = leadsFeature ? leadsFeature.module_id : null;

                if (!leadsFeatureId || !moduleId) {
                    alert('Required feature or module not found.');
                    return;
                }

                const PermissionResponse = await axios.get(`http://localhost:8000/user_permissions/${userId}/${moduleId}/${leadsFeatureId}/`);
                const permissions = PermissionResponse.data;

                const hasDeletePermission = permissions.some(permission =>
                    permission.d_delete === true
                );

                const hasEditPermission = permissions.some(permission =>
                    permission.d_edit === true
                );

                setEditPermissions(hasEditPermission);
                setDeletePermissions(hasDeletePermission);
            } catch (error) {
                console.error("Error checking delete permissions:", error);
            }
            finally {
                setLoading(false);
            }
        };

        fetchCallStatuses();
        fetchMeetingStatuses();
        fetchPermissions();
        fetchLeads();
        fetchUserName();
    }, [userId, moduleId]);

    const fetchLeadStageName = async (leadStageId) => {
        try {
            const response = await axios.get(`http://localhost:8000/lead_stage_name/${leadStageId}/`);
            setLeadStageName((prev) => ({
                ...prev,
                [leadStageId]: response.data.name,
            }));
        } catch (error) {
            console.error("Error fetching lead stage name:", error);
        }
    };



    const fetchLeadStatusName = async (leadStatusId) => {
        try {
            const response = await axios.get(`http://localhost:8000/lead_status_name/${leadStatusId}/`);
            setLeadStatusName((prev) => ({
                ...prev,
                [leadStatusId]: response.data.name,
            }));
        } catch (error) {
            console.error("Error fetching lead status name:", error);
        }
    };

    const fetchLeadTypeName = async (leadTypeId) => {
        try {
            const response = await axios.get(`http://localhost:8000/lead_type_name/${leadTypeId}/`);
            setLeadTypeName((prev) => ({
                ...prev,
                [leadTypeId]: response.data.name,
            }));
            console.log("Lead Type Name:", response.data.name);
        } catch (error) {
            console.error("Error fetching lead type name:", error);
        }
    };


    const fetchMeetings = async (leadId) => {
        try {
            const response = await axios.get(`http://localhost:8000/meetings/${leadId}/`);
            setMeetings((prev) => ({
                ...prev,
                [leadId]: response.data,
            }));
        } catch (error) {
            console.error("Error fetching meetings:", error);
        }
    };

    const fetchCalls = async (leadId) => {
        try {
            const response = await axios.get(`http://localhost:8000/calls/${leadId}/`);
            setCalls((prev) => ({
                ...prev,
                [leadId]: response.data,
            }));
        } catch (error) {
            console.error("Error fetching calls:", error);
        }
    };

    const handleAddLead = () => {
        navigate('/RealEstate/AddLeads', {
            state: {
                userId,
                moduleId
            }
        });
    };

    const handleDeleteLead = async () => {
        navigate('/RealEstate/DeleteLead', {
            state: {
                userId,
                moduleId
            }
        });

    };

    const handleEditLead = () => {
        navigate('/RealEstate/EditLead', {
            state: {
                userId,
                moduleId
            }
        });
    };

    const handleAddCall = () => {
        navigate('/RealEstate/AddCall', { state: { userId, moduleId } });
    };

    const handleAddMeeting = () => {
        navigate('/RealEstate/AddMeeting', { state: { userId, moduleId } });
    };

    const toggleLeadDetails = async (id, leadStageId, leadStatusId, leadTypeId, assignedToId) => {
        fetchLeadStageName(leadStageId);
        fetchLeadStatusName(leadStatusId);
        fetchLeadTypeName(leadTypeId);

        if (expandedLeadId === id) {
            setExpandedLeadId(null);
        } else {
            await fetchMeetings(id);
            await fetchCalls(id);
            setExpandedLeadId(id);
        }
    };

    return (
        <div className="container mt-5">
            <h5>Welcome: {userName ? userName : 'Guest'}</h5>
            <h2 className="mb-4">Leads</h2>
            <div className="d-flex justify-content-between mb-3">
                <button className="btn btn-primary" onClick={handleAddLead}>
                    Add Lead
                </button>
                <div className="d-flex justify-content-center flex-grow-1">
                    <button className="btn btn-success me-2" onClick={() => handleAddCall()}>
                        Add Call
                    </button>
                    <button className="btn btn-success" onClick={() => handleAddMeeting()}>
                        Add Meeting
                    </button>
                </div>
                <div className="d-flex justify-content-end flex-grow-1">
                    <div className="d-flex align-items-center">
                        {!loading && deletePermissions ? (
                            <button className="btn btn-danger btn-sm me-2" onClick={() => handleDeleteLead()}>
                                Delete Lead
                            </button>
                        ) : (
                            <span className="me-2"></span>
                        )}

                        {!loading && editPermissions ? (
                            <button className="btn btn-success btn-sm me-2" onClick={() => handleEditLead()}>
                                Edit Lead
                            </button>
                        ) : (
                            <span className="me-2"></span>
                        )}
                    </div>
                </div>
            </div>
            <table className="table table-striped table-bordered table-sm">
                <thead className="thead-light">
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>View</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((lead) => (
                        <React.Fragment key={lead.lead_id}>
                            <tr>
                                <td>{lead.name}</td>
                                <td>{lead.lead_phone}</td>
                                <td>{lead.email}</td>
                                <td>
                                    <button className="btn btn-info btn-sm" onClick={() => toggleLeadDetails(lead.lead_id, lead.lead_stage, lead.lead_status, lead.lead_type)}>
                                        {expandedLeadId === lead.lead_id ? 'Hide Details' : 'Show Details'}
                                    </button>
                                </td>
                            </tr>
                            {expandedLeadId === lead.lead_id && (
                                <tr>
                                    <td colSpan="7">
                                        <div className="p-2">
                                            <strong>Job Title:</strong> {lead.job_title}<br />
                                            <strong>Company Domain:</strong> {lead.company_domain}<br />
                                            <strong>Lead Stage:</strong> {leadStageName[lead.lead_stage]}<br />
                                            <strong>Lead Status:</strong> {leadStatusName[lead.lead_status]}<br />
                                            <strong>Lead Type:</strong> {leadTypeName[lead.lead_type]}<br />
                                            <strong>Gender:</strong> {lead.gender}
                                        </div>
                                        <div className="mt-2">
                                            <h5>Meetings</h5>
                                            {meetings[lead.lead_id] && meetings[lead.lead_id].length > 0 ? (
                                                <ul>
                                                    {meetings[lead.lead_id].map((meeting, index) => {
                                                        const meetingStatus = meetingStatuses.find(status => status.id === meeting.meeting_status);
                                                        const statusName = meetingStatus ? meetingStatus.meeting_status : 'Unknown Status';

                                                        const meetingKey = `${lead.lead_id}-meeting-${meeting.meeting_id || index}-${meeting.company_domain}-${meeting.meeting_date}`;

                                                        return (
                                                            <li key={meetingKey}>
                                                                <strong>Status:</strong> {statusName} <br />
                                                                <strong>Call Date:</strong> {new Date(meeting.meeting_date).toLocaleString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    second: '2-digit',
                                                                    hour12: false  // Set to false for 24-hour format
                                                                })} <br /><br />                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <p>No meetings found for this lead.</p>
                                            )}
                                        </div>
                                        <div className="mt-2">
                                            <h5>Calls</h5>
                                            {calls[lead.lead_id] && calls[lead.lead_id].length > 0 ? (
                                                <ul>
                                                    {calls[lead.lead_id].map((call, index) => {
                                                        const callStatus = callStatuses.find(status => status.id === call.call_status);
                                                        const statusName = callStatus ? callStatus.call_status : 'Unknown Status';

                                                        const callKey = `${lead.lead_id}-call-${call.call_id || index}-${call.company_domain}-${call.call_date}`;

                                                        return (
                                                            <li key={callKey}>
                                                                <strong>Status:</strong> {statusName} <br />
                                                                <strong>Call Date:</strong> {new Date(call.call_date).toLocaleString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    second: '2-digit',
                                                                    hour12: false  // Set to false for 24-hour format
                                                                })} <br /><br />
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <p>No calls found for this lead.</p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RealEstate;