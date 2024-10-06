import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation} from 'react-router-dom';

const EditSalary = () => {
    const location = useLocation();

    const employeeId = location.state?.employeeId;
    const company_domain = location.state?.company_domain;
    const due_year = location.state?.due_year;
    const due_month = location.state?.due_month;

    const [salary, setSalary] = useState({
        company_domain: '',
        gross_salary: '',
        insurance: '',
        taxes: '',
        net_salary: '',
        due_year: new Date().getFullYear(),
        due_month: new Date().getMonth() + 1,
        due_date: '',
    });

    const [companyDomains, setCompanyDomains] = useState([]);

    useEffect(() => {
        const fetchSalaryData = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/salary/${company_domain}/${employeeId}/${due_year}/${due_month}/`);
                setSalary(response.data);
            } catch (error) {
                console.error("There was an error fetching the salary data!", error);
            }
        };

        const fetchCompanyDomains = async () => {
            try {
                console.log("EmployeeID", employeeId);
                const response = await axios.get(`http://localhost:8000/employees_company_domain/${employeeId}/`);
                const companies = response.data.map(employee => employee.company_domain);
                setCompanyDomains(companies);
            } catch (error) {
                console.error("There was an error fetching the company domains!", error);
            }
        };

        fetchSalaryData();
        fetchCompanyDomains();
    }, [employeeId, company_domain, due_year, due_month]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setSalary({
            ...salary,
            [name]: value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.put(`http://localhost:8000/edit_salary/${company_domain}/${employeeId}/${due_year}/${due_month}/`, salary);
            alert("Salary updated successfully!");
        } catch (error) {
            alert(`Error: ${JSON.stringify(error.response.data)}`);
            console.error("There was an error updating the salary!", error.response.data);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Edit Salary</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="company_domain">Company Domain</label>
                    <select
                        name="company_domain"
                        id="company_domain"
                        className="form-control"
                        value={salary.company_domain}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Company Domain</option>
                        {companyDomains.map((domain, index) => (
                            <option key={index} value={domain}>
                                {domain}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="gross_salary">Gross Salary</label>
                    <input
                        type="number"
                        name="gross_salary"
                        id="gross_salary"
                        className="form-control"
                        value={salary.gross_salary}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="insurance">Insurance</label>
                    <input
                        type="number"
                        name="insurance"
                        id="insurance"
                        className="form-control"
                        value={salary.insurance}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="taxes">Taxes</label>
                    <input
                        type="number"
                        name="taxes"
                        id="taxes"
                        className="form-control"
                        value={salary.taxes}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="net_salary">Net Salary</label>
                    <input
                        type="number"
                        name="net_salary"
                        id="net_salary"
                        className="form-control"
                        value={salary.net_salary}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="due_year">Due Year</label>
                    <input
                        type="number"
                        name="due_year"
                        id="due_year"
                        className="form-control"
                        value={salary.due_year}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="due_month">Due Month</label>
                    <select
                        name="due_month"
                        id="due_month"
                        className="form-control"
                        value={salary.due_month}
                        onChange={handleInputChange}
                        required
                    >
                        {[...Array(12).keys()].map(month => (
                            <option key={month + 1} value={month + 1}>
                                {month + 1}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="due_date">Due Date</label>
                    <input
                        type="date"
                        name="due_date"
                        id="due_date"
                        className="form-control"
                        value={salary.due_date}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary mt-3">Update Salary</button>
            </form>
        </div>
    );
};

export default EditSalary;