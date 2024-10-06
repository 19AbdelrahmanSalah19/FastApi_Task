import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [options, setOptions] = useState(null);
  const [userId, setUserId] = useState(null);
  const [modules, setModules] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/modules/');
        setModules(response.data);  // Store the fetched modules
      } catch (error) {
        console.error("There was an error fetching the data!", error);
      }
    };

    fetchData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const credentials = { username, password };

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setUserId(data.user_id);

        const moduleIds = data.module_id;

        const uniqueModuleIds = [...new Set(moduleIds)];

        if (uniqueModuleIds.length === 1) {
          const moduleName = modules.find(module => module.id === uniqueModuleIds[0])?.name;
          navigate(moduleName === "REAL_ESTATE" ? "/RealEstate" : "/HR", {
            state: { userId: data.user_id, moduleId: uniqueModuleIds[0] }
          });
        } else if (uniqueModuleIds.length > 1) {
          const options = uniqueModuleIds.map(id => {
            const module = modules.find(mod => mod.id === id);
            return {
              id,
              name: module ? module.name : `Module ${id}` 
            };
          });

          const validOptions = options.filter(option => option.name !== `Module ${option.id}`);
          setOptions(validOptions.length > 0 ? validOptions : null); 
        }
      } else {
        setMessage("Login failed. Check your credentials.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  const handleSelectModule = (selectedModuleId) => {
    const selectedModule = modules.find(module => module.id === selectedModuleId);
    const moduleName = selectedModule?.name;

   
    navigate(moduleName === "REAL_ESTATE" ? "/RealEstate" : "/HR", {
      state: {
        userId,
        moduleId: selectedModuleId
      }
    });
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