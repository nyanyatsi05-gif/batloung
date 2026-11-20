# Backend structure

```text
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── mapController.js
│   └── reportController.js
├── middleware/
│   ├── asyncHandler.js
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   └── distributionModel.js
├── routes/
│   ├── mapRoutes.js
│   ├── advancedReportRoutes.js
│   └── existing application routes...
├── .env.example
├── db.js
├── server.js
└── package.json
```

`config/database.js` creates a `mysql2/promise` pool using environment variables. The added model/controller routes demonstrate asynchronous queries and centralized error handling. The original callback-based connection remains for compatibility with the application's existing routes.
