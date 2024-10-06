import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import HR from './HR';
import RealEstate from './RealEstate';
import AddLeads from './AddLeads';
import AddCall from './AddCall';
import AddMeeting from './AddMeeting';
import DeleteLead from './DeleteLead';
import EditLead from './EditLead';
import EditSpecificLead from './EditSpecificLead';
import AddEmployee from './AddEmployee';
import AddSalary from './AddSalary';
import EditEmployee from './EditEmployee';
import EditSalary from './EditSalary';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/HR',
    element: <HR />,
  },
  {
    path: '/RealEstate',
    element: <RealEstate />,
  },
  {
    path: '/RealEstate/AddLeads',
    element: <AddLeads />,
  },
  {
    path: '/RealEstate/AddCall',
    element: <AddCall />,
  },
  {
    path: '/RealEstate/AddMeeting',
    element: <AddMeeting />,
  },
  {
    path: '/RealEstate/DeleteLead',
    element: <DeleteLead />,
  },
  {
    path: '/RealEstate/EditLead',
    element: <EditLead />,
  },
  {
    path: '/RealEstate/EditLead/EditSpecificLead',
    element: <EditSpecificLead />,
  },
  {
    path: '/HR/AddEmployee',
    element: <AddEmployee />,
  },
  {
    path: '/HR/AddSalary',
    element: <AddSalary />,
  },
  {
    path: '/HR/EditEmployee',
    element: <EditEmployee />,
  },
  {
    path: '/HR/EditSalary',
    element: <EditSalary />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </React.StrictMode>
);
