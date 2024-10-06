import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from 'react-router-dom';

const DeleteLead = () => {
    const [leads, setLeads] = useState([]);
    const [expandedLeadId, setExpandedLeadId] = useState(null);
    const location = useLocation();
    const userId = location.state?.userId;
    const moduleId = location.state?.moduleId;
    const [leadStageName, setLeadStageName] = useState({});
    const [leadStatusName, setLeadStatusName] = useState({});
    const [leadTypeName, setLeadTypeName] = useState({});
    const [assignedToName, setAssignedToName] = useState({});
    const [meetings, setMeetings] = useState({}); 
    const [calls, setCalls] = useState({}); 
    const [callStatuses, setCallStatuses] = useState([]);
    const [meetingStatuses, setMeetingStatuses] = useState([]); 
    const [deletePermissions, setDeletePermissions] = useState([]);
    const [userName, setUserName] = useState([]);
    const [loading, setLoading] = useState(true); 


    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/leads/`);
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

        const fetchDeletePermissions = async () => {
            try {
                setLoading(true);
                const featureResponse = await axios.get(`http://localhost:8000/module_features/`);
                const leadsFeature = featureResponse.data.find(feature => feature.name === "Leads");
                const leadsFeatureId = leadsFeature ? leadsFeature.module_id : null;

                if (!leadsFeatureId || !moduleId) {
                    alert('Required feature or module not found.');
                    return;
                }

                const deletePermissionResponse = await axios.get(`http://localhost:8000/user_permissions/${userId}/${moduleId}/${leadsFeatureId}/`);
                const permissions = deletePermissionResponse.data;

                const hasDeletePermission = permissions.some(permission =>
                    permission.d_delete === true
                );

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
        fetchDeletePermissions();
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

    const handleDeleteLead = async (leadId) => {
        try {
            // Proceed to delete the lead
            await axios.delete(`http://localhost:8000/leads/${leadId}/`);
            setLeads((prevLeads) => prevLeads.filter(lead => lead.lead_id !== leadId));
            alert('Lead deleted successfully.');
        } catch (error) {
            console.error("Error deleting lead:", error);
            alert('There was an error processing your request.');
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

    const fetchAssignedToName = async (assignedToId) => {
        try {
            const response = await axios.get(`http://localhost:8000/assigned_to_name/${assignedToId}/`);
            setAssignedToName((prev) => ({
                ...prev,
                [assignedToId]: response.data.name, 
            }));
        } catch (error) {
            console.error("Error fetching assigned to name:", error);
        }
    };

    // Fetch meetings for a specific lead
    const fetchMeetings = async (leadId) => {
        try {
            const response = await axios.get(`http://localhost:8000/meetings/${leadId}/`);
            setMeetings((prev) => ({
                ...prev,
                [leadId]: response.data, // Store meetings in state
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

   


    const toggleLeadDetails = async (id, leadStageId, leadStatusId, leadTypeId, assignedToId) => {
        fetchLeadStageName(leadStageId);
        fetchLeadStatusName(leadStatusId);
        fetchLeadTypeName(leadTypeId);
        fetchAssignedToName(assignedToId);

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
            <h2 className="mb-4">ALL LEADS</h2>

            <table className="table table-striped table-bordered table-sm">
                <thead className="thead-light">
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Action</th>
                        {!loading && deletePermissions && <th>Delete</th>}
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
                                    <button className="btn btn-info btn-sm" onClick={() => toggleLeadDetails(lead.lead_id, lead.lead_stage, lead.lead_status, lead.lead_type, lead.assigned_to)}>
                                        {expandedLeadId === lead.lead_id ? 'Hide Details' : 'Show Details'}
                                    </button>
                                </td>
                                <td>
                                    {!loading && deletePermissions ? (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLead(lead.lead_id)}>
                                            Delete
                                        </button>
                                    ) : (
                                        <span></span>
                                    )}
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
                                            <strong>Assigned To:</strong> {assignedToName[lead.assigned_to]}<br />
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
                                                                <strong>Company Domain:</strong> {meeting.company_domain} <br />
                                                                <strong>Status:</strong> {statusName} <br />
                                                                <strong>Meeting Date:</strong> {new Date(meeting.meeting_date).toLocaleString()} <br />
                                                            </li>
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
                                                                <strong>Company Domain:</strong> {call.company_domain} <br />
                                                                <strong>Status:</strong> {statusName} <br />
                                                                <strong>Call Date:</strong> {new Date(call.call_date).toLocaleString()} <br />
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

export default DeleteLead;