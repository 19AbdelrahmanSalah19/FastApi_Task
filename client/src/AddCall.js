import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from 'react-router-dom';

const AddCall = () => {
    const [users, setUsers] = useState([]);
    const [callStatuses, setCallStatuses] = useState([]);
    const [filteredCallStatuses, setFilteredCallStatuses] = useState([]);
    const [companyDomain, setCompanyDomain] = useState([]);
    const [leads, setLeads] = useState([]); 
    const location = useLocation();
    const moduleId = location.state?.moduleId;
    const [call, setCall] = useState({
        company_domain: '',
        call_date: '',
        lead_id: '', 
        assigned_to: '',
        call_status: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersResponse = await axios.get(`http://localhost:8000/users/${moduleId}/`);
                setUsers(usersResponse.data);

                const statusesResponse = await axios.get('http://localhost:8000/calls_status/');
                setCallStatuses(statusesResponse.data);

                const domainsResponse = await axios.get('http://localhost:8000/company_domain/');
                setCompanyDomain(domainsResponse.data);
            } catch (error) {
                console.error("There was an error fetching the data!", error);
            }
        };

        fetchData();
    }, [moduleId]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCall({ ...call, [name]: value });
    };

    const handleCompanyDomainChange = (event) => {
        const selectedDomain = event.target.value;
        setCall((prevCall) => ({
            ...prevCall,
            company_domain: selectedDomain,
        }));

        const filteredStatuses = callStatuses.filter(status => status.company_domain === selectedDomain);
        setFilteredCallStatuses(filteredStatuses);

        setCall(prevCall => ({
            ...prevCall,
            call_status: '' 
        }));
    };

    const handleUserChange = async (event) => {
        const selectedUserId = event.target.value;
        setCall((prevCall) => ({
            ...prevCall,
            assigned_to: selectedUserId,
        }));

        try {
            const leadsResponse = await axios.get(`http://localhost:8000/leads/${selectedUserId}`);
            setLeads(leadsResponse.data); 
            setCall((prevCall) => ({
                ...prevCall,
                lead_id: '', 
            }));
        } catch (error) {
            console.error("There was an error fetching the leads!", error);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const utcDate = new Date(call.call_date + 'Z');
        const isoDate = utcDate.toISOString();

        const payload = {
            ...call,
            call_date: isoDate, 
        };
        axios.post('http://localhost:8000/calls/', payload)
            .then(response => {
                console.log("ADDED DATE: ", payload.call_date)
                alert("Call added successfully!");
            })
            .catch(error => {
                alert(`Error: ${JSON.stringify(error.response.data)}`);
                console.error("There was an error adding the call!", error.response.data);
            });
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Add New Call</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="company_domain">Company Domain</label>
                    <select
                        name="company_domain"
                        id="company_domain"
                        className="form-control"
                        value={call.company_domain}
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
                    <label htmlFor="call_date">Call Date</label>
                    <input
                        type="datetime-local"
                        name="call_date"
                        id="call_date"
                        className="form-control"
                        value={call.call_date}
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
                        value={call.assigned_to}
                        onChange={handleUserChange} 
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
                    <label htmlFor="lead_id">Lead Name</label>
                    <select
                        name="lead_id"
                        id="lead_id"
                        className="form-control"
                        value={call.lead_id}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Lead</option>
                        {leads.map(lead => (
                            <option key={lead.lead_id} value={lead.lead_id}>
                                {lead.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="call_status">Call Status</label>
                    <select
                        name="call_status"
                        id="call_status"
                        className="form-control"
                        value={call.call_status}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Call Status</option>
                        {filteredCallStatuses.map(status => (
                            <option key={status.id} value={status.id}>
                                {status.call_status}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary mt-3">Add Call</button>
            </form>
        </div>
    );
};

export default AddCall;