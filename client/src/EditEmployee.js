import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from 'react-router-dom';

const EditEmployee = () => {
    const [employee, setEmployee] = useState({
        company_domain: '',
        contact_name: '',
        business_phone: '',
        personal_phone: '',
        business_email: '',
        personal_email: '',
        gender: '',
        is_company_admin: false,
    });

    const [companyDomain, setCompanyDomain] = useState([]);
    const location = useLocation();
    const employeeId = location.state?.employeeId;

    useEffect(() => {
        const fetchCompanyDomains = async () => {
            try {
                const domainsResponse = await axios.get('http://localhost:8000/company_domain/');
                setCompanyDomain(domainsResponse.data);
            } catch (error) {
                console.error("There was an error fetching company domains!", error);
            }
        };

        const fetchEmployeeData = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/employee/${employeeId}/`);
                setEmployee(response.data);
            } catch (error) {
                console.error("There was an error fetching the employee data!", error);
            }
        };

        fetchCompanyDomains();
        fetchEmployeeData();
    }, [employeeId]);

    const handleInputChange = (event) => {
        const { name, type, checked, value } = event.target;
        setEmployee({
            ...employee,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Updating employee:", employee);
        axios.put(`http://localhost:8000/edit_employee/${employeeId}/`, employee)
            .then(response => {
                alert("Employee updated successfully!");
            })
            .catch(error => {
                alert(`Error: ${JSON.stringify(error.response.data)}`);
                console.error("There was an error updating the Employee!", error.response.data);
            });
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Edit Employee</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="company_domain">Company Domain</label>
                    <select
                        name="company_domain"
                        id="company_domain"
                        className="form-control"
                        value={employee.company_domain}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Company Domain</option>
                        {companyDomain.map(company => (
                            <option key={company.company_domain} value={company.company_domain}>
                                {company.company_domain}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="contact_name">Contact Name</label>
                    <input
                        type="text"
                        name="contact_name"
                        id="contact_name"
                        className="form-control"
                        value={employee.contact_name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="business_phone">Business Phone</label>
                    <input
                        type="text"
                        name="business_phone"
                        id="business_phone"
                        className="form-control"
                        value={employee.business_phone}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="personal_phone">Personal Phone</label>
                    <input
                        type="text"
                        name="personal_phone"
                        id="personal_phone"
                        className="form-control"
                        value={employee.personal_phone}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="business_email">Business Email</label>
                    <input
                        type="email"
                        name="business_email"
                        id="business_email"
                        className="form-control"
                        value={employee.business_email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="personal_email">Personal Email</label>
                    <input
                        type="email"
                        name="personal_email"
                        id="personal_email"
                        className="form-control"
                        value={employee.personal_email}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="gender">Gender</label>
                    <select
                        name="gender"
                        id="gender"
                        className="form-control"
                        value={employee.gender}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>

                <div className="form-group form-check mt-3">
                    <input
                        type="checkbox"
                        name="is_company_admin"
                        id="is_company_admin"
                        className="form-check-input"
                        checked={employee.is_company_admin}
                        onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="is_company_admin">
                        Is Company Admin
                    </label>
                </div>

                <button type="submit" className="btn btn-primary mt-3">Update Employee</button>
            </form>
        </div>
    );
};

export default EditEmployee;