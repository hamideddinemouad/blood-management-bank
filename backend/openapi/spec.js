const jsonContent = (schema, example) => ({
  "application/json": {
    schema,
    ...(example ? { example } : {}),
  },
});

const successMessageResponse = (description, exampleMessage) => ({
  description,
  content: jsonContent(
    { $ref: "#/components/schemas/SuccessMessage" },
    { success: true, message: exampleMessage },
  ),
});

const errorMessageResponse = (description, exampleMessage) => ({
  description,
  content: jsonContent(
    { $ref: "#/components/schemas/ErrorMessage" },
    { success: false, message: exampleMessage },
  ),
});

const bearerSecurity = [{ bearerAuth: [] }];

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Blood Bank Management System API",
    version: "1.0.0",
    description:
      "REST API documentation for the Blood Bank Management System backend.",
  },
  tags: [
    { name: "Auth", description: "Authentication and profile endpoints" },
    { name: "Public", description: "Publicly accessible endpoints" },
    { name: "Donor", description: "Donor dashboard, profile, camps, and history" },
    { name: "Facility", description: "Shared facility profile and dashboard endpoints" },
    { name: "Hospital", description: "Hospital requests, stock, history, and donor outreach" },
    { name: "Blood Lab", description: "Blood-lab camps, stock, requests, and dashboard endpoints" },
    { name: "Admin", description: "Administrative reporting and moderation endpoints" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    parameters: {
      pageQuery: {
        name: "page",
        in: "query",
        schema: { type: "integer", minimum: 1, default: 1 },
      },
      limitQuery: {
        name: "limit",
        in: "query",
        schema: { type: "integer", minimum: 1, default: 10 },
      },
      statusQuery: {
        name: "status",
        in: "query",
        schema: { type: "string" },
      },
      searchQuery: {
        name: "search",
        in: "query",
        schema: { type: "string" },
      },
      idPath: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
      campIdPath: {
        name: "campId",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
    },
    schemas: {
      SuccessMessage: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully" },
        },
      },
      ErrorMessage: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Something went wrong" },
        },
      },
      Address: {
        type: "object",
        properties: {
          street: { type: "string", example: "123 Hassan II Ave" },
          city: { type: "string", example: "Casablanca" },
          state: { type: "string", example: "Casablanca-Settat" },
          pincode: { type: "string", example: "20000" },
        },
      },
      OperatingHours: {
        type: "object",
        properties: {
          open: { type: "string", example: "09:00" },
          close: { type: "string", example: "18:00" },
          workingDays: {
            type: "array",
            items: {
              type: "string",
              enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            },
          },
        },
      },
      HistoryEntry: {
        type: "object",
        properties: {
          eventType: { type: "string", example: "Profile Update" },
          description: { type: "string", example: "Facility profile updated by user" },
          date: { type: "string", format: "date-time" },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "string", example: "6800abc123def4567890fedc" },
          email: { type: "string", example: "demo.admin@bbmsmaroc.com" },
          role: {
            type: "string",
            enum: ["donor", "hospital", "blood-lab", "admin", "superadmin"],
          },
          status: { type: "string", example: "approved" },
        },
      },
      Donor: {
        type: "object",
        properties: {
          _id: { type: "string" },
          fullName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          role: { type: "string", example: "donor" },
          bloodGroup: { type: "string", example: "O+" },
          age: { type: "integer", example: 28 },
          gender: { type: "string", example: "Male" },
          weight: { type: "number", example: 72 },
          address: { $ref: "#/components/schemas/Address" },
          lastDonationDate: { type: "string", format: "date-time", nullable: true },
          nextEligibleDate: { type: "string", format: "date-time", nullable: true },
          eligibleToDonate: { type: "boolean" },
          isActive: { type: "boolean" },
        },
      },
      Facility: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          emergencyContact: { type: "string" },
          facilityType: { type: "string", enum: ["hospital", "blood-lab"] },
          role: { type: "string", enum: ["hospital", "blood-lab"] },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
          facilityCategory: { type: "string" },
          registrationNumber: { type: "string" },
          address: { $ref: "#/components/schemas/Address" },
          operatingHours: { $ref: "#/components/schemas/OperatingHours" },
          is24x7: { type: "boolean" },
          emergencyServices: { type: "boolean" },
          history: {
            type: "array",
            items: { $ref: "#/components/schemas/HistoryEntry" },
          },
        },
      },
      DonationHistoryEntry: {
        type: "object",
        properties: {
          id: { type: "string" },
          donationDate: { type: "string", format: "date-time" },
          facility: { type: "string", example: "Clinique Demo" },
          city: { type: "string", example: "Casablanca" },
          state: { type: "string", example: "Casablanca-Settat" },
          bloodGroup: { type: "string", example: "A+" },
          quantity: { type: "number", example: 1 },
          remarks: { type: "string", nullable: true },
          verified: { type: "boolean" },
        },
      },
      BloodCamp: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string", example: "Downtown Blood Drive" },
          description: { type: "string" },
          date: { type: "string", format: "date-time" },
          time: {
            type: "object",
            properties: {
              start: { type: "string", example: "09:00" },
              end: { type: "string", example: "15:00" },
            },
          },
          location: {
            type: "object",
            properties: {
              venue: { type: "string", example: "Rabat Central Hospital" },
              city: { type: "string", example: "Rabat" },
              state: { type: "string", example: "Rabat-Sale-Kenitra" },
              pincode: { type: "string", example: "10000" },
            },
          },
          expectedDonors: { type: "integer", example: 120 },
          actualDonors: { type: "integer", example: 48 },
          status: {
            type: "string",
            enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
          },
        },
      },
      BloodUnit: {
        type: "object",
        properties: {
          _id: { type: "string" },
          bloodGroup: { type: "string", example: "O-" },
          quantity: { type: "number", example: 4 },
          expiryDate: { type: "string", format: "date-time" },
          hospital: { type: "string", nullable: true },
          bloodLab: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      BloodRequest: {
        type: "object",
        properties: {
          _id: { type: "string" },
          hospitalId: { type: "string" },
          labId: { type: "string" },
          bloodType: { type: "string", example: "B+" },
          units: { type: "integer", example: 3 },
          status: { type: "string", enum: ["pending", "accepted", "rejected"] },
          notes: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          processedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      RegisterDonorRequest: {
        type: "object",
        required: [
          "role",
          "fullName",
          "email",
          "password",
          "phone",
          "bloodGroup",
          "age",
          "gender",
          "address",
        ],
        properties: {
          role: { type: "string", enum: ["donor"], example: "donor" },
          fullName: { type: "string", example: "Demo Donor BBMS Maroc" },
          email: { type: "string", example: "demo.donor@bbmsmaroc.com" },
          password: { type: "string", example: "DemoPass123!" },
          phone: { type: "string", example: "0612345678" },
          bloodGroup: { type: "string", example: "A+" },
          age: { type: "integer", example: 29 },
          gender: { type: "string", example: "Female" },
          weight: { type: "number", example: 60 },
          address: { $ref: "#/components/schemas/Address" },
          healthInfo: {
            type: "object",
            properties: {
              weight: { type: "number", example: 60 },
              height: { type: "number", example: 168 },
              hasDiseases: { type: "boolean", example: false },
              diseaseDetails: { type: "string", nullable: true },
            },
          },
        },
      },
      RegisterFacilityRequest: {
        type: "object",
        required: [
          "role",
          "name",
          "email",
          "password",
          "phone",
          "emergencyContact",
          "registrationNumber",
          "facilityType",
          "address",
          "documents",
        ],
        properties: {
          role: { type: "string", enum: ["hospital", "blood-lab"] },
          name: { type: "string", example: "Demo Hospital BBMS Maroc" },
          email: { type: "string", example: "demo.hospital@bbmsmaroc.com" },
          password: { type: "string", example: "DemoPass123!" },
          phone: { type: "string", example: "0612345678" },
          emergencyContact: { type: "string", example: "0611111111" },
          registrationNumber: { type: "string", example: "MA-HOSP-DEMO-001" },
          facilityType: { type: "string", enum: ["hospital", "blood-lab"] },
          facilityCategory: { type: "string", example: "Private" },
          address: { $ref: "#/components/schemas/Address" },
          documents: {
            type: "object",
            properties: {
              registrationProof: {
                type: "object",
                properties: {
                  url: { type: "string", example: "https://example.com/proof.pdf" },
                  filename: { type: "string", example: "proof.pdf" },
                },
              },
            },
          },
          operatingHours: { $ref: "#/components/schemas/OperatingHours" },
          is24x7: { type: "boolean", example: false },
          emergencyServices: { type: "boolean", example: true },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "demo.admin@bbmsmaroc.com" },
          password: { type: "string", example: "DemoPass123!" },
        },
      },
      DemoAccessRequest: {
        type: "object",
        required: ["roleKey"],
        properties: {
          roleKey: {
            type: "string",
            enum: ["admin", "donor", "hospital", "bloodLab"],
            example: "donor",
          },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Login successful" },
          token: { type: "string", example: "jwt.token.here" },
          user: { $ref: "#/components/schemas/AuthUser" },
          redirect: { type: "string", example: "/donor" },
        },
      },
      LandingStatsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          stats: {
            type: "object",
            properties: {
              livesSaved: { type: "integer", example: 1500 },
              bloodUnits: { type: "integer", example: 500 },
              partnerHospitals: { type: "integer", example: 21 },
              responseTime: { type: "string", example: "47 min" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a donor, hospital, or blood-lab account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { $ref: "#/components/schemas/RegisterDonorRequest" },
                  { $ref: "#/components/schemas/RegisterFacilityRequest" },
                ],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Registration successful",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                user: { $ref: "#/components/schemas/AuthUser" },
                redirect: { type: "string" },
              },
            }),
          },
          400: errorMessageResponse("Validation error", "Role is required"),
          409: errorMessageResponse(
            "Duplicate resource",
            "An account with that email already exists",
          ),
          500: errorMessageResponse("Server error", "Registration failed"),
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in as donor, facility, or admin",
        requestBody: {
          required: true,
          content: jsonContent({ $ref: "#/components/schemas/LoginRequest" }),
        },
        responses: {
          200: {
            description: "Login successful",
            content: jsonContent({ $ref: "#/components/schemas/LoginResponse" }),
          },
          400: errorMessageResponse("Missing credentials", "Email and password are required"),
          401: errorMessageResponse("Invalid credentials", "Invalid credentials"),
          403: errorMessageResponse(
            "Account status blocks login",
            "Your account is awaiting admin approval. Please wait before logging in.",
          ),
          500: errorMessageResponse("Server error", "Login failed"),
        },
      },
    },
    "/api/auth/demo-access": {
      post: {
        tags: ["Auth"],
        summary: "Instantly sign into a seeded demo account",
        requestBody: {
          required: true,
          content: jsonContent({ $ref: "#/components/schemas/DemoAccessRequest" }),
        },
        responses: {
          200: {
            description: "Demo login successful",
            content: jsonContent({ $ref: "#/components/schemas/LoginResponse" }),
          },
          400: errorMessageResponse("Invalid role selection", "Invalid demo role selected"),
          404: errorMessageResponse(
            "Demo account missing",
            "Demo account is unavailable after refresh",
          ),
          500: errorMessageResponse(
            "Demo preparation failed",
            "Unable to prepare fresh demo data right now",
          ),
        },
      },
    },
    "/api/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Get the authenticated user profile",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Profile fetched",
            content: jsonContent({
              type: "object",
              properties: {
                user: {
                  oneOf: [
                    { $ref: "#/components/schemas/Donor" },
                    { $ref: "#/components/schemas/Facility" },
                    { $ref: "#/components/schemas/AuthUser" },
                  ],
                },
              },
            }),
          },
          401: errorMessageResponse("Unauthorized", "User not found or unauthorized"),
          404: errorMessageResponse("Not found", "User not found"),
          500: errorMessageResponse("Server error", "Error fetching profile"),
        },
      },
    },
    "/api/public/landing-stats": {
      get: {
        tags: ["Public"],
        summary: "Get landing-page metrics",
        responses: {
          200: {
            description: "Landing stats fetched",
            content: jsonContent({ $ref: "#/components/schemas/LandingStatsResponse" }),
          },
          500: errorMessageResponse("Server error", "Failed to load landing stats"),
        },
      },
    },
    "/api/donor/profile": {
      get: {
        tags: ["Donor"],
        summary: "Get donor profile details",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Donor profile fetched",
            content: jsonContent({
              type: "object",
              properties: {
                donor: {
                  allOf: [
                    { $ref: "#/components/schemas/Donor" },
                    {
                      type: "object",
                      properties: {
                        totalDonations: { type: "integer", example: 4 },
                        donationHistory: {
                          type: "array",
                          items: { $ref: "#/components/schemas/DonationHistoryEntry" },
                        },
                      },
                    },
                  ],
                },
              },
            }),
          },
          404: errorMessageResponse("Not found", "Donor not found"),
          500: errorMessageResponse("Server error", "Error fetching donor profile"),
        },
      },
      put: {
        tags: ["Donor"],
        summary: "Update donor profile details",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            properties: {
              fullName: { type: "string" },
              phone: { type: "string" },
              address: { $ref: "#/components/schemas/Address" },
              age: { type: "integer" },
              gender: { type: "string" },
              weight: { type: "number" },
              password: { type: "string" },
            },
          }),
        },
        responses: {
          200: {
            description: "Donor updated",
            content: jsonContent({
              type: "object",
              properties: {
                message: { type: "string" },
                donor: { $ref: "#/components/schemas/Donor" },
              },
            }),
          },
          400: errorMessageResponse("Validation error", "Validation failed"),
          404: errorMessageResponse("Not found", "Donor not found"),
          500: errorMessageResponse("Server error", "Error updating profile"),
        },
      },
    },
    "/api/donor/camps": {
      get: {
        tags: ["Donor"],
        summary: "List camps available to the authenticated donor",
        security: bearerSecurity,
        parameters: [
          { name: "status", in: "query", schema: { type: "string", default: "all" } },
          { name: "q", in: "query", schema: { type: "string" } },
          { $ref: "#/components/parameters/pageQuery" },
          { $ref: "#/components/parameters/limitQuery" },
        ],
        responses: {
          200: {
            description: "Camps fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    camps: {
                      type: "array",
                      items: { $ref: "#/components/schemas/BloodCamp" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        total: { type: "integer" },
                        currentPage: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            }),
          },
          401: errorMessageResponse("Unauthorized", "Unauthorized. Please log in."),
          500: errorMessageResponse("Server error", "Failed to fetch blood camps"),
        },
      },
    },
    "/api/donor/camps/{campId}/register": {
      post: {
        tags: ["Donor"],
        summary: "Register the authenticated donor for a camp",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/campIdPath" }],
        responses: {
          200: successMessageResponse("Registration succeeded", "Successfully registered for camp"),
          400: errorMessageResponse("Invalid registration", "Invalid camp ID"),
          404: errorMessageResponse("Resource not found", "Camp not found"),
          500: errorMessageResponse("Server error", "Failed to register for camp"),
        },
      },
      delete: {
        tags: ["Donor"],
        summary: "Unregister the authenticated donor from a camp",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/campIdPath" }],
        responses: {
          200: successMessageResponse("Unregistered", "Camp registration removed successfully"),
          400: errorMessageResponse("Invalid request", "Invalid camp ID"),
          404: errorMessageResponse("Resource not found", "Camp not found"),
          500: errorMessageResponse("Server error", "Failed to unregister from camp"),
        },
      },
    },
    "/api/donor/history": {
      get: {
        tags: ["Donor"],
        summary: "Get donor donation history",
        security: bearerSecurity,
        responses: {
          200: {
            description: "History fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "array",
                  items: { $ref: "#/components/schemas/DonationHistoryEntry" },
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Failed to fetch donor history"),
        },
      },
    },
    "/api/donor/stats": {
      get: {
        tags: ["Donor"],
        summary: "Get donor dashboard statistics",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Stats fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                stats: { type: "object", additionalProperties: true },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Failed to fetch donor stats"),
        },
      },
    },
    "/api/facility/dashboard": {
      get: {
        tags: ["Facility"],
        summary: "Get shared facility dashboard summary",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Dashboard fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                facility: { type: "string" },
                facilityType: { type: "string" },
                stats: { type: "object", additionalProperties: true },
              },
            }),
          },
          404: errorMessageResponse("Not found", "Facility not found"),
          500: errorMessageResponse("Server error", "Error fetching dashboard data"),
        },
      },
    },
    "/api/facility/profile": {
      get: {
        tags: ["Facility"],
        summary: "Get facility profile",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Profile fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                facility: { $ref: "#/components/schemas/Facility" },
              },
            }),
          },
          404: errorMessageResponse("Not found", "Facility not found"),
          500: errorMessageResponse("Server error", "Server error while fetching profile"),
        },
      },
      put: {
        tags: ["Facility"],
        summary: "Update facility profile",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            properties: {
              name: { type: "string" },
              phone: { type: "string" },
              emergencyContact: { type: "string" },
              address: { $ref: "#/components/schemas/Address" },
              operatingHours: { $ref: "#/components/schemas/OperatingHours" },
              services: { type: "array", items: { type: "string" } },
              description: { type: "string" },
              website: { type: "string" },
              contactPerson: { type: "string" },
              password: { type: "string" },
            },
          }),
        },
        responses: {
          200: {
            description: "Profile updated",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                facility: { $ref: "#/components/schemas/Facility" },
              },
            }),
          },
          400: errorMessageResponse("Validation error", "Failed to update profile"),
          404: errorMessageResponse("Not found", "Facility not found"),
        },
      },
    },
    "/api/facility/labs": {
      get: {
        tags: ["Facility"],
        summary: "List approved blood labs",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Labs fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                labs: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Facility" },
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Error fetching blood labs"),
        },
      },
    },
    "/api/hospital/blood/request": {
      post: {
        tags: ["Hospital"],
        summary: "Create a blood request from a hospital to a lab",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["labId", "bloodType", "units"],
            properties: {
              labId: { type: "string" },
              bloodType: { type: "string", example: "A-" },
              units: { type: "integer", example: 2 },
            },
          }),
        },
        responses: {
          201: {
            description: "Request created",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: { $ref: "#/components/schemas/BloodRequest" },
              },
            }),
          },
          400: errorMessageResponse(
            "Validation error",
            "Please provide labId, bloodType, and units",
          ),
          404: errorMessageResponse(
            "Lab unavailable",
            "Blood lab not found or not approved",
          ),
          500: errorMessageResponse("Server error", "Error sending blood request"),
        },
      },
    },
    "/api/hospital/blood/requests": {
      get: {
        tags: ["Hospital"],
        summary: "List blood requests created by the authenticated hospital",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Requests fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BloodRequest" },
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Failed to fetch blood requests"),
        },
      },
    },
    "/api/hospital/dashboard": {
      get: {
        tags: ["Hospital"],
        summary: "Get hospital dashboard data",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Dashboard fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                stats: { type: "object", additionalProperties: true },
                inventory: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BloodUnit" },
                },
                recentRequests: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BloodRequest" },
                },
                hospital: { $ref: "#/components/schemas/Facility" },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Failed to load hospital dashboard"),
        },
      },
    },
    "/api/hospital/blood/stock": {
      get: {
        tags: ["Hospital"],
        summary: "Get hospital blood stock",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Stock fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BloodUnit" },
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Failed to fetch hospital stock"),
        },
      },
    },
    "/api/hospital/history": {
      get: {
        tags: ["Hospital"],
        summary: "Get hospital activity history",
        security: bearerSecurity,
        responses: {
          200: {
            description: "History fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                history: {
                  type: "array",
                  items: { $ref: "#/components/schemas/HistoryEntry" },
                },
              },
            }),
          },
          404: errorMessageResponse("Not found", "Hospital not found"),
          500: errorMessageResponse("Server error", "Failed to fetch hospital history"),
        },
      },
    },
    "/api/hospital/donors": {
      get: {
        tags: ["Hospital"],
        summary: "Search and list donors available to hospitals",
        security: bearerSecurity,
        parameters: [
          { $ref: "#/components/parameters/searchQuery" },
          { name: "bloodGroup", in: "query", schema: { type: "string", default: "all" } },
          { name: "city", in: "query", schema: { type: "string", default: "all" } },
          { name: "availability", in: "query", schema: { type: "string", default: "all" } },
          { name: "sortBy", in: "query", schema: { type: "string", default: "lastDonation" } },
          { $ref: "#/components/parameters/pageQuery" },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          200: {
            description: "Donors fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  additionalProperties: true,
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Failed to fetch donors"),
        },
      },
    },
    "/api/hospital/donors/{id}/contact": {
      post: {
        tags: ["Hospital"],
        summary: "Log a donor contact attempt from a hospital",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: false,
          content: jsonContent({
            type: "object",
            properties: {
              notes: { type: "string", example: "Called donor and left a voicemail." },
            },
          }),
        },
        responses: {
          200: successMessageResponse("Contact logged", "Donor contact attempt logged successfully"),
          404: errorMessageResponse("Not found", "Donor not found"),
          500: errorMessageResponse("Server error", "Failed to log contact attempt"),
        },
      },
    },
    "/api/blood-lab/dashboard": {
      get: {
        tags: ["Blood Lab"],
        summary: "Get blood-lab dashboard data",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Dashboard fetched",
            content: jsonContent({
              type: "object",
              properties: {
                stats: { type: "object", additionalProperties: true },
                recentCamps: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BloodCamp" },
                },
                facility: { $ref: "#/components/schemas/Facility" },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Failed to fetch blood lab dashboard data"),
        },
      },
    },
    "/api/blood-lab/history": {
      get: {
        tags: ["Blood Lab"],
        summary: "Get blood-lab activity and login history",
        security: bearerSecurity,
        responses: {
          200: {
            description: "History fetched",
            content: jsonContent({
              type: "object",
              properties: {
                activity: {
                  type: "array",
                  items: { $ref: "#/components/schemas/HistoryEntry" },
                },
                logins: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string", format: "date-time" },
                      ip: { type: "string" },
                    },
                  },
                },
              },
            }),
          },
          404: errorMessageResponse("Not found", "Blood Lab not found"),
          500: errorMessageResponse("Server error", "Failed to fetch blood lab history"),
        },
      },
    },
    "/api/blood-lab/camps": {
      post: {
        tags: ["Blood Lab"],
        summary: "Create a blood camp",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["title", "date", "time", "location"],
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              date: { type: "string", format: "date" },
              time: {
                type: "object",
                properties: {
                  start: { type: "string", example: "09:00" },
                  end: { type: "string", example: "15:00" },
                },
              },
              location: {
                type: "object",
                properties: {
                  venue: { type: "string" },
                  city: { type: "string" },
                  state: { type: "string" },
                  pincode: { type: "string" },
                },
              },
              expectedDonors: { type: "integer" },
            },
          }),
        },
        responses: {
          201: {
            description: "Camp created",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: { $ref: "#/components/schemas/BloodCamp" },
              },
            }),
          },
          400: errorMessageResponse("Validation error", "Camp date cannot be in the past"),
          500: errorMessageResponse("Server error", "Internal server error"),
        },
      },
      get: {
        tags: ["Blood Lab"],
        summary: "List blood camps for the authenticated lab",
        security: bearerSecurity,
        parameters: [
          { name: "status", in: "query", schema: { type: "string", default: "all" } },
          { $ref: "#/components/parameters/pageQuery" },
          { $ref: "#/components/parameters/limitQuery" },
        ],
        responses: {
          200: {
            description: "Camps fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    camps: {
                      type: "array",
                      items: { $ref: "#/components/schemas/BloodCamp" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        total: { type: "integer" },
                        currentPage: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Failed to fetch blood camps"),
        },
      },
    },
    "/api/blood-lab/camps/{id}": {
      put: {
        tags: ["Blood Lab"],
        summary: "Update a blood camp",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: true,
          content: jsonContent({ $ref: "#/components/schemas/BloodCamp" }),
        },
        responses: {
          200: successMessageResponse("Camp updated", "Blood camp updated successfully"),
          400: errorMessageResponse("Invalid request", "Invalid camp ID"),
          404: errorMessageResponse("Not found", "Camp not found"),
          500: errorMessageResponse("Server error", "Failed to update blood camp"),
        },
      },
      delete: {
        tags: ["Blood Lab"],
        summary: "Delete a blood camp",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        responses: {
          200: successMessageResponse("Camp deleted", "Camp deleted successfully"),
          400: errorMessageResponse("Invalid request", "Invalid camp ID"),
          404: errorMessageResponse("Not found", "Camp not found"),
          500: errorMessageResponse("Server error", "Failed to delete camp"),
        },
      },
    },
    "/api/blood-lab/camps/{id}/status": {
      patch: {
        tags: ["Blood Lab"],
        summary: "Update camp status",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["status"],
            properties: {
              status: {
                type: "string",
                enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
              },
            },
          }),
        },
        responses: {
          200: successMessageResponse("Status updated", "Camp status updated successfully"),
          400: errorMessageResponse("Invalid status", "Invalid camp status"),
          404: errorMessageResponse("Not found", "Camp not found"),
          500: errorMessageResponse("Server error", "Failed to update camp status"),
        },
      },
    },
    "/api/blood-lab/blood/add": {
      post: {
        tags: ["Blood Lab"],
        summary: "Add blood stock to the current lab",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["bloodGroup", "quantity", "expiryDate"],
            properties: {
              bloodGroup: { type: "string", example: "AB+" },
              quantity: { type: "number", example: 5 },
              expiryDate: { type: "string", format: "date-time" },
            },
          }),
        },
        responses: {
          201: successMessageResponse("Stock added", "Blood stock added successfully"),
          400: errorMessageResponse("Validation error", "Blood group, quantity and expiry date are required"),
          500: errorMessageResponse("Server error", "Failed to add blood stock"),
        },
      },
    },
    "/api/blood-lab/blood/remove": {
      post: {
        tags: ["Blood Lab"],
        summary: "Remove blood stock from the current lab",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["bloodGroup", "quantity"],
            properties: {
              bloodGroup: { type: "string" },
              quantity: { type: "number" },
            },
          }),
        },
        responses: {
          200: successMessageResponse("Stock removed", "Blood stock updated successfully"),
          400: errorMessageResponse("Validation error", "Insufficient stock available"),
          500: errorMessageResponse("Server error", "Failed to remove blood stock"),
        },
      },
    },
    "/api/blood-lab/blood/stock": {
      get: {
        tags: ["Blood Lab"],
        summary: "Get blood-lab stock",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Stock fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BloodUnit" },
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Failed to fetch blood stock"),
        },
      },
    },
    "/api/blood-lab/blood/requests": {
      get: {
        tags: ["Blood Lab"],
        summary: "List blood requests assigned to the current lab",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Requests fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BloodRequest" },
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Failed to fetch blood requests"),
        },
      },
    },
    "/api/blood-lab/blood/requests/{id}": {
      put: {
        tags: ["Blood Lab"],
        summary: "Accept or reject a hospital blood request",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["status"],
            properties: {
              status: { type: "string", enum: ["accepted", "rejected"] },
              notes: { type: "string" },
            },
          }),
        },
        responses: {
          200: successMessageResponse("Request updated", "Blood request updated successfully"),
          400: errorMessageResponse("Invalid request", "Invalid status value"),
          404: errorMessageResponse("Not found", "Blood request not found"),
          500: errorMessageResponse("Server error", "Failed to update blood request"),
        },
      },
    },
    "/api/blood-lab/labs": {
      get: {
        tags: ["Blood Lab"],
        summary: "List approved blood labs",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Labs fetched",
            content: jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Facility" },
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Failed to fetch labs"),
        },
      },
    },
    "/api/blood-lab/donors/search": {
      get: {
        tags: ["Blood Lab"],
        summary: "Search donors from the blood-lab interface",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/searchQuery" }],
        responses: {
          200: {
            description: "Donors fetched",
            content: jsonContent({
              type: "object",
              additionalProperties: true,
            }),
          },
          500: errorMessageResponse("Server error", "Failed to search donors"),
        },
      },
    },
    "/api/blood-lab/donors/donate/{id}": {
      post: {
        tags: ["Blood Lab"],
        summary: "Mark a donor donation from the blood-lab flow",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: false,
          content: jsonContent({
            type: "object",
            properties: {
              bloodGroup: { type: "string" },
              quantity: { type: "number" },
              remarks: { type: "string" },
            },
          }),
        },
        responses: {
          200: successMessageResponse("Donation recorded", "Donation marked successfully"),
          404: errorMessageResponse("Not found", "Donor not found"),
          500: errorMessageResponse("Server error", "Failed to mark donation"),
        },
      },
    },
    "/api/blood-lab/donations/recent": {
      get: {
        tags: ["Blood Lab"],
        summary: "Get recent donations recorded by the blood-lab interface",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Recent donations fetched",
            content: jsonContent({
              type: "object",
              additionalProperties: true,
            }),
          },
          500: errorMessageResponse("Server error", "Failed to fetch recent donations"),
        },
      },
    },
    "/api/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Get admin dashboard statistics",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Stats fetched",
            content: jsonContent({
              type: "object",
              properties: {
                totalDonors: { type: "integer" },
                totalFacilities: { type: "integer" },
                approvedFacilities: { type: "integer" },
                pendingFacilities: { type: "integer" },
                totalDonations: { type: "integer" },
                activeDonors: { type: "integer" },
                upcomingCamps: { type: "integer" },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Failed to fetch stats"),
        },
      },
    },
    "/api/admin/facilities": {
      get: {
        tags: ["Admin"],
        summary: "List all facilities",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Facilities fetched",
            content: jsonContent({
              type: "object",
              properties: {
                facilities: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Facility" },
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Error fetching facilities"),
        },
      },
    },
    "/api/admin/facility/approve/{id}": {
      put: {
        tags: ["Admin"],
        summary: "Approve a facility",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        responses: {
          200: successMessageResponse("Facility approved", "Facility approved"),
          404: errorMessageResponse("Not found", "Facility not found"),
          500: errorMessageResponse("Server error", "Error approving facility"),
        },
      },
    },
    "/api/admin/facility/reject/{id}": {
      put: {
        tags: ["Admin"],
        summary: "Reject a facility",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["rejectionReason"],
            properties: {
              rejectionReason: { type: "string", example: "Missing registration proof." },
            },
          }),
        },
        responses: {
          200: successMessageResponse("Facility rejected", "Facility rejected and status updated"),
          400: errorMessageResponse("Missing reason", "Rejection reason is required."),
          404: errorMessageResponse("Not found", "Facility not found"),
          500: errorMessageResponse("Server error", "Error rejecting facility"),
        },
      },
    },
    "/api/admin/donors": {
      get: {
        tags: ["Admin"],
        summary: "List all donors",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Donors fetched",
            content: jsonContent({
              type: "object",
              properties: {
                donors: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Donor" },
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Error fetching donors"),
        },
      },
    },
    "/api/admin/donations": {
      get: {
        tags: ["Admin"],
        summary: "List all donation records across donors",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Donation records fetched",
            content: jsonContent({
              type: "object",
              properties: {
                donations: {
                  type: "array",
                  items: { type: "object", additionalProperties: true },
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Error fetching donation records"),
        },
      },
    },
    "/api/admin/camps": {
      get: {
        tags: ["Admin"],
        summary: "List all blood camp records",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Camp records fetched",
            content: jsonContent({
              type: "object",
              properties: {
                camps: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BloodCamp" },
                },
              },
            }),
          },
          500: errorMessageResponse("Server error", "Error fetching blood camps"),
        },
      },
    },
    "/api/admin/donors/{id}/eligibility": {
      patch: {
        tags: ["Admin"],
        summary: "Update donor donation eligibility",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["eligibleToDonate"],
            properties: {
              eligibleToDonate: { type: "boolean" },
            },
          }),
        },
        responses: {
          200: successMessageResponse("Eligibility updated", "Donor marked as eligible"),
          400: errorMessageResponse(
            "Validation error",
            "eligibleToDonate must be a boolean value",
          ),
          404: errorMessageResponse("Not found", "Donor not found"),
          500: errorMessageResponse("Server error", "Failed to update donor eligibility"),
        },
      },
    },
    "/api/admin/donors/{id}/account-status": {
      patch: {
        tags: ["Admin"],
        summary: "Activate or suspend a donor account",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["isActive"],
            properties: {
              isActive: { type: "boolean" },
            },
          }),
        },
        responses: {
          200: successMessageResponse("Account status updated", "Donor account activated"),
          400: errorMessageResponse("Validation error", "isActive must be a boolean value"),
          404: errorMessageResponse("Not found", "Donor not found"),
          500: errorMessageResponse("Server error", "Failed to update donor account status"),
        },
      },
    },
    "/api/admin/facilities/{id}/review-status": {
      patch: {
        tags: ["Admin"],
        summary: "Set facility review status",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["status"],
            properties: {
              status: {
                type: "string",
                enum: ["pending", "approved", "rejected"],
              },
              rejectionReason: { type: "string" },
            },
          }),
        },
        responses: {
          200: successMessageResponse("Review status updated", "Facility review status updated"),
          400: errorMessageResponse("Validation error", "Rejection reason is required."),
          404: errorMessageResponse("Not found", "Facility not found"),
          500: errorMessageResponse("Server error", "Failed to update facility review status"),
        },
      },
    },
    "/api/admin/facilities/{id}/account-status": {
      patch: {
        tags: ["Admin"],
        summary: "Activate or suspend a facility account",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["isActive"],
            properties: {
              isActive: { type: "boolean" },
            },
          }),
        },
        responses: {
          200: successMessageResponse("Facility account updated", "Facility account activated"),
          400: errorMessageResponse("Validation error", "isActive must be a boolean value"),
          404: errorMessageResponse("Not found", "Facility not found"),
          500: errorMessageResponse("Server error", "Failed to update facility account status"),
        },
      },
    },
  },
};

export default swaggerSpec;
