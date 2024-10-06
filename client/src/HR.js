import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HR = () => {
    const location = useLocation();
    const userId = location.state?.userId;
    const moduleId = location.state?.moduleId;
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [salaries, setSalaries] = useState({});
    const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
    const [userName, setUserName] = useState([]);



    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/employees/`);
                setEmployees(response.data);
            } catch (error) {
                console.error("There was an error fetching the data!", error);
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

        fetchUserName();
        fetchEmployees();
    }, [userId, moduleId]);


    const fetchSalaries = async (employeeId) => {
        try {
            const response = await axios.get(`http://localhost:8000/salaries/${employeeId}/`);
            setSalaries((prev) => ({
                ...prev,
                [employeeId]: response.data,
            }));
        } catch (error) {
            console.error("Error fetching salaries:", error);
        }
    };

    const handleDeleteEmployee = async (employeeId) => {
        try {
            await axios.delete(`http://localhost:8000/employees/${employeeId}/`);
            setEmployees((prev) => prev.filter((employee) => employee.employee_id !== employeeId));
            alert("Employee deleted successfully!");
        } catch (error) {
            console.error("Error deleting employee:", error);
        }
    }

    const handleAddEmployee = () => {
        navigate('/HR/AddEmployee', { state: { userId, moduleId } });
    }

    const handleAddSalary = (employeeId) => {
        navigate('/HR/AddSalary', { state: { userId, moduleId, employeeId } });
    }

    const handleEditEmployee = (employeeId) => {
        navigate('/HR/EditEmployee', { state: { userId, moduleId, employeeId } });
    }

    const handleEditSalary = (employeeId, company_domain, due_year, due_month) => {
        navigate('/HR/EditSalary', { state: { userId, moduleId, employeeId, company_domain, due_year, due_month } });
    }

    const toggleEmployeeDetails = async (id) => {

        if (expandedEmployeeId === id) {
            setExpandedEmployeeId(null); 
        } else {
            await fetchSalaries(id);
            setExpandedEmployeeId(id);
        }
    };

    return (
        <div className="container mt-5">
            <h5>Welcome: {userName ? userName : 'Guest'}</h5>
            <h2 className="mb-4">ALL EMPLOYEES</h2>

            <button className="btn btn-primary" onClick={handleAddEmployee}>
                Add Employee
            </button>



            <table className="table table-striped table-bordered table-sm">
                <thead className="thead-light">
                    <tr>
                        <th>Company Domain</th>
                        <th>Contact Name</th>
                        <th>View</th>
                        <th>Delete</th>
                        <th>Edit</th>
                        <th>Add Salary</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((employee) => (
                        <React.Fragment key={employee.employee_id}>
                            <tr>
                                <td>{employee.company_domain}</td>
                                <td>{employee.contact_name}</td>
                                <td>
                                    <button className="btn btn-info btn-sm" onClick={() => toggleEmployeeDetails(employee.employee_id)}>
                                        {expandedEmployeeId === employee.employee_id ? 'Hide Details' : 'Show Details'}
                                    </button>
                                </td>
                                <td>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEmployee(employee.employee_id)}>
                                        Delete
                                    </button>
                                </td>
                                <td>
                                    <button className="btn btn-success btn-sm me-2" onClick={() => handleEditEmployee(employee.employee_id)}>
                                        Edit Employee
                                    </button></td>
                                <td>
                                    <button className="btn btn-success btn-sm" onClick={() => handleAddSalary(employee.employee_id)}>
                                        Add Salary
                                    </button>
                                </td>
                            </tr>
                            {expandedEmployeeId === employee.employee_id && (
                                <tr>
                                    <td colSpan="7">
                                        <div className="p-2">
                                            <strong>Business Phone:</strong> {employee.business_phone}<br />
                                            <strong>Personal Phone:</strong> {employee.personal_phone}<br />
                                            <strong>Business Email:</strong> {employee.business_email}<br />
                                            <strong>Personal Email:</strong> {employee.personal_email}<br />
                                            <strong>Gender:</strong> {employee.gender}<br />
                                            <strong>Is Company Admin:</strong> {employee.is_company_admin ? "Yes" : "No"}<br />
                                        </div>
                                        <div className="mt-2">
                                            <h5>Salary</h5>
                                            {salaries[employee.employee_id] && salaries[employee.employee_id].length > 0 ? (
                                                <ul>
                                                    {salaries[employee.employee_id].map((salary, index) => {
                                                        const salaryKey = `${employee.employee_id}-salary-${salary.salary_id || index}-${salary.company_domain}-${salary.salary_date}`;

                                                        return (
                                                            <li key={salaryKey} style={{ marginBottom: '25px' }}>
                                                                <strong>Gross Salary:</strong> {salary.gross_salary} <br />
                                                                <strong>Insurance:</strong> {salary.insurance} <br />
                                                                <strong>Taxes:</strong> {salary.taxes} <br />
                                                                <strong>Net Salary:</strong> {salary.net_salary} <br />
                                                                <strong>Due Year:</strong> {salary.due_year} <br />
                                                                <strong>Due Month:</strong> {salary.due_month} <br />
                                                                <strong>Due Date:</strong> {new Date(salary.due_date).toLocaleString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long', // Change to 'numeric' if you want month as a number
                                                                    day: 'numeric'
                                                                })} <br />                                                                <button
                                                                    onClick={() => handleEditSalary(salary.employee_id,
                                                                        salary.company_domain,
                                                                        salary.due_year,
                                                                        salary.due_month,)}
                                                                    className="btn btn-primary mt-2"
                                                                >
                                                                    Edit Salary
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <p>No salaries found for this employee.</p>
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

export default HR;