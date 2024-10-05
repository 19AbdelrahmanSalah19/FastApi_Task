import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from 'react-router-dom';

const AddMeeting = () => {
    const [users, setUsers] = useState([]);
    const [meetingStatuses, setMeetingStatuses] = useState([]);
    const [filteredMeetingStatuses, setFilteredMeetingStatuses] = useState([]);
    const [companyDomain, setCompanyDomain] = useState([]);
    const location = useLocation();
    const userId = location.state?.userId;
    const leadId = location.state?.leadId;
    const [meeting, setMeeting] = useState({
        company_domain: '',
        meeting_date: '',
        lead_id: leadId,
        assigned_to: '',
        meeting_status: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersResponse = await axios.get('http://localhost:8000/users/');
                setUsers(usersResponse.data);

                const statusesResponse = await axios.get('http://localhost:8000/meeting_status/');
                setMeetingStatuses(statusesResponse.data);

                const domainsResponse = await axios.get('http://localhost:8000/company_domain/');
                setCompanyDomain(domainsResponse.data);
            } catch (error) {
                console.error("There was an error fetching the data!", error);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setMeeting({ ...meeting, [name]: value });
    };

    const handleCompanyDomainChange = (event) => {
        const selectedDomain = event.target.value;
        setMeeting((prevMeeting) => ({
            ...prevMeeting,
            company_domain: selectedDomain,
        }));

        // Filter statuses based on selected domain
        const filteredStatuses = meetingStatuses.filter(status => status.company_domain === selectedDomain);
        setFilteredMeetingStatuses(filteredStatuses);

        // Reset meeting status if domain changes
        setMeeting(prevMeeting => ({
            ...prevMeeting,
            meeting_status: ''
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        //console.log("Submitting meeting:", meeting);
        const isoDate = new Date(meeting.meeting_date).toISOString();

        const payload = {
            ...meeting,
            meeting_date: isoDate, // Set meeting_date to ISO format
        };
        axios.post('http://localhost:8000/meetings/', payload)
            .then(response => {
                alert("Meeting added successfully!");
            })
            .catch(error => {
                alert(`Error: ${JSON.stringify(error.response.data)}`);
                console.error("There was an error adding the meeting!", error.response.data);
            });
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Add New Meeting</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="company_domain">Company Domain</label>
                    <select
                        name="company_domain"
                        id="company_domain"
                        className="form-control"
                        value={meeting.company_domain}
                        onChange={handleCompanyDomainChange}
                    >
                        <option value="">Select Company Domain</option>
                        {companyDomain.map(company => (
                            <option key={company.company_domain} value={company.company_domain}>
                                {company.company_domain}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="meeting_date">Meeting Date</label>
                    <input
                        type="datetime-local"
                        name="meeting_date"
                        id="meeting_date"
                        className="form-control"
                        value={meeting.meeting_date}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="assigned_to">Assign to</label>
                    <select
                        name="assigned_to"
                        id="assigned_to"
                        className="form-control"
                        value={meeting.assigned_to}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Assign to</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="meeting_status">Meeting Status</label>
                    <select
                        name="meeting_status"
                        id="meeting_status"
                        className="form-control"
                        value={meeting.meeting_status}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Meeting Status</option>
                        {filteredMeetingStatuses.map(status => (
                            <option key={status.id} value={status.id}>
                                {status.meeting_status}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary mt-3">Add Meeting</button>
            </form>
        </div>
    );
};

export default AddMeeting;