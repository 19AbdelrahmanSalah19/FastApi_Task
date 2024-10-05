import React from 'react';
import { useState } from "react";
//import HR from './HR';
//import RealEstate from './RealEstate';
import 'bootstrap/dist/css/bootstrap.min.css';
//import AddLeads from './AddLeads';
import {useNavigate } from 'react-router-dom';

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [options, setOptions] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  

  const handleLogin = async (e) => {
    e.preventDefault();
    const credentials = {
      username: username,
      password: password,
    };

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setUserId(data.user_id);

        const moduleIds = data.module_id; // Assuming module_id is an array now

        // Check for unique module IDs
        const uniqueModuleIds = [...new Set(moduleIds)];

        if (uniqueModuleIds.length === 1) {
          // Redirect to single module
          navigate(uniqueModuleIds[0] === 1 ? "/RealEstate" : "/HR", { state: { userId: data.user_id } });
        } else if (uniqueModuleIds.length > 1) {
          // If there are multiple unique module IDs
          const options = uniqueModuleIds.map(id => ({
            id,
            name: id === 1 ? "RealEstate" : "HR"
          }));
          setOptions(options);
        }
      } else {
        setMessage("Login failed. Check your credentials.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  const handleSelectModule = (selection) => {
    // Redirect based on the selected module
    navigate(selection === 1 ? "/RealEstate" : "/HR", { state: { userId } });
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
      <div className="card p-4 shadow">
        <h2 className="text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <p className="text-danger">{message}</p>

        {options && (
          <div className="mt-3">
            <h5>Select a Module:</h5>
            {options.map((option) => (
              <button key={option.id} className="btn btn-secondary w-100 mb-2" onClick={() => handleSelectModule(option.id)}>
                {option.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  
}

export default App;



// export default function RouterApp() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<App />} />
//         <Route path="/HR" element={<HR />} />
//         <Route path="/RealEstate" element={<RealEstate />}>
//           <Route path="add-lead" element={<AddLeads />} /> 
//         </Route>
//       </Routes>
//     </Router>
//   );
// }