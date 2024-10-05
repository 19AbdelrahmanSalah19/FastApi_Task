// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// import 'bootstrap/dist/css/bootstrap.min.css';


// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import HR from './HR';
import RealEstate from './RealEstate';
import AddLeads from './AddLeads';
import AddCall from './AddCall';
import AddMeeting from './AddMeeting';

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
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </React.StrictMode>
);
