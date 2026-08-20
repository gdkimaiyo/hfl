# Health Facility Locator - HFL

Health Facility Locator. Number one healthcare facility locator in Kenya. Find healthcare facilities near you, their main services, capacity and ownership.

## Project Structure

HealthFacilityLocator is organized as a full-stack application with separate frontend and backend projects.

```text
hfl/
│
├── frontend/       # Vue3 + Quasar Framework frontend
├── server/         # Node.js + Express.js + MongoDB
├── README.md
├── LICENSE
└── ...
```

### Frontend

The `frontend` directory contains the Vue3 application responsible for the user interface and client-side interactions.

**Technologies:**

- Vue3
- TypeScript
- Quasar Framework
- API integration

See the [frontend README](./frontend/README.md) for setup instructions and frontend-specific documentation.

### Backend

The `server` directory contains the Node.js and Express.js APIs

**Technologies:**

- Node.js
- Express.js
- MongoDB
- APIs

See the [server README](./server/README.md) for backend setup instructions and API documentation.

## Getting Started

Clone the repository:

```bash
git clone https://github.com/gdkimaiyo/hfl.git
cd hfl
```

The frontend and backend are maintained as separate applications. Follow the setup instructions in each directory's README.

### Start the Backend

```bash
cd server
```

Follow the instructions in [`server/README.md`](./server/README.md).

### Start the Frontend

```bash
cd frontend
```

Follow the instructions in [`frontend/README.md`](./frontend/README.md).

## License

[License](LICENSE)
