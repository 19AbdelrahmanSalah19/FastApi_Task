# FastApi_Task

## Getting Started

### Setting Up the React Frontend

1. Navigate to the `client` directory:
    ```bash
    cd client
    ```

2. Install the necessary React packages:
    ```bash
    npm install
    ```

3. Start the React application:
    ```bash
    npm start
    ```

### Setting Up the FastAPI Backend

1. Create and activate a virtual environment:
    ```bash
    python -m venv .venv
    .venv\Scripts\activate
    ```

2. Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```

4. Ensure to set the correct path to the sql database server in the `.env` file.

5. Start the FastAPI server:
    ```bash
    uvicorn main:app --reload
    ```
