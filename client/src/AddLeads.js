import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from 'react-router-dom';


const AddLeads = () => {
    const [users, setUsers] = useState([]);
    const [leadStages, setLeadStages] = useState([]);
    const [leadStatuses, setLeadStatuses] = useState([]);
    const [leadTypes, setLeadTypes] = useState([]);
    const [companyDomain, setCompanyDomain] = useState([]);
    const location = useLocation();
    const moduleId = location.state?.moduleId;
    const [lead, setLead] = useState({
        company_domain: '',
        lead_phone: '',
        name: '',
        email: '',
        job_title: '',
        assigned_to: '',
        lead_stage: '',
        lead_status: '',
        lead_type: '',
        gender: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersResponse = await axios.get(`http://localhost:8000/users/${moduleId}/`);
                setUsers(usersResponse.data);

                const stagesResponse = await axios.get('http://localhost:8000/lead_stages/');
                setLeadStages(stagesResponse.data);

                const statusesResponse = await axios.get('http://localhost:8000/lead_statuses/');
                setLeadStatuses(statusesResponse.data);

                const domainsResponse = await axios.get('http://localhost:8000/company_domain/');
                setCompanyDomain(domainsResponse.data);

                const typesResponse = await axios.get('http://localhost:8000/lead_types/');
                setLeadTypes(typesResponse.data);
            } catch (error) {
                console.error("There was an error fetching the data!", error);
            }
        };

        fetchData();
    }, [moduleId]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setLead({ ...lead, [name]: value });
    };

    const handleCompanyDomainChange = (event) => {
        const selectedDomain = event.target.value;
        setLead((prevLead) => ({
            ...prevLead,
            company_domain: selectedDomain,
        }));

        const filteredStages = leadStages.filter(stage => stage.company_domain === selectedDomain);
        const filteredStatuses = leadStatuses.filter(status => status.company_domain === selectedDomain);
        const filteredTypes = leadTypes.filter(type => type.company_domain === selectedDomain);

        setLeadStages(filteredStages);
        setLeadStatuses(filteredStatuses);
        setLeadTypes(filteredTypes);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Submitting lead:", lead);
        axios.post('http://localhost:8000/leads/', lead)
            .then(response => {
                alert("Lead added successfully!");
            })
            .catch(error => {
                alert(`Error: ${JSON.stringify(error.response.data)}`);
                console.error("There was an error adding the lead!", error.response.data);
            });
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Add New Lead</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="company_domain">Company Domain</label>
                    <select
                        name="company_domain"
                        id="company_domain"
                        className="form-control"
                        value={lead.company_domain}
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
                    <label htmlFor="lead_phone">Lead Phone</label>
                    <input
                        type="text"
                        name="lead_phone"
                        id="lead_phone"
                        className="form-control"
                        placeholder="Lead Phone"
                        value={lead.lead_phone}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="name">Lead Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        className="form-control"
                        placeholder="Lead Name"
                        value={lead.name}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Lead Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        className="form-control"
                        placeholder="Lead Email"
                        value={lead.email}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="job_title">Job Title</label>
                    <input
                        type="text"
                        name="job_title"
                        id="job_title"
                        className="form-control"
                        placeholder="Job Title"
                        value={lead.job_title}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                        name="gender"
                        id="gender"
                        className="form-control"
                        value={lead.gender}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="assigned_to">Assign to</label>
                    <select
                        name="assigned_to"
                        id="assigned_to"
                        className="form-control"
                        value={lead.assigned_to}
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
                    <label htmlFor="lead_stage">Lead Stage</label>
                    <select
                        name="lead_stage"
                        id="lead_stage"
                        className="form-control"
                        value={lead.lead_stage}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Lead Stage</option>
                        {leadStages.map(stage => (
                            <option key={stage.id} value={stage.id}>
                                {stage.lead_stage}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="lead_status">Lead Status</label>
                    <select
                        name="lead_status"
                        id="lead_status"
                        className="form-control"
                        value={lead.lead_status}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Lead Status</option>
                        {leadStatuses.map(status => (
                            <option key={status.id} value={status.id}>
                                {status.lead_status}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="lead_type">Lead Type</label>
                    <select
                        name="lead_type"
                        id="lead_type"
                        className="form-control"
                        value={lead.lead_type}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Lead Type</option>
                        {leadTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.lead_type}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary mt-3">Add Lead</button>
            </form>
        </div>
    );
};

export default AddLeads;