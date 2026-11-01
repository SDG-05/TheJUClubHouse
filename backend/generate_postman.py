import json
import os

collection = {
    "info": {"name": "University Club Directory", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"},
    "item": [
        {"name": "Auth", "item": [
            {"name": "Register", "request": {"method": "POST", "header": [{"key": "Content-Type", "value": "application/json"}], "body": {"mode": "raw", "raw": "{\"name\": \"New Student\", \"email\": \"new@student.com\", \"password\": \"Pass1234!\"}"}, "url": {"raw": "{{base_url}}/api/auth/register/", "host": ["{{base_url}}"], "path": ["api", "auth", "register", ""]}}},
            {"name": "Login (Student)", "event": [{"listen": "test", "script": {"exec": ["var jsonData = pm.response.json();", "pm.environment.set(\"student_token\", jsonData.access);"]}}], "request": {"method": "POST", "header": [{"key": "Content-Type", "value": "application/json"}], "body": {"mode": "raw", "raw": "{\"email\": \"student1@university.edu\", \"password\": \"Pass1234!\"}"}, "url": {"raw": "{{base_url}}/api/auth/login/", "host": ["{{base_url}}"], "path": ["api", "auth", "login", ""]}}},
            {"name": "Login (Manager)", "event": [{"listen": "test", "script": {"exec": ["var jsonData = pm.response.json();", "pm.environment.set(\"manager_token\", jsonData.access);"]}}], "request": {"method": "POST", "header": [{"key": "Content-Type", "value": "application/json"}], "body": {"mode": "raw", "raw": "{\"email\": \"manager.robotics@university.edu\", \"password\": \"Pass1234!\"}"}, "url": {"raw": "{{base_url}}/api/auth/login/", "host": ["{{base_url}}"], "path": ["api", "auth", "login", ""]}}},
            {"name": "Login (Admin)", "event": [{"listen": "test", "script": {"exec": ["var jsonData = pm.response.json();", "pm.environment.set(\"admin_token\", jsonData.access);"]}}], "request": {"method": "POST", "header": [{"key": "Content-Type", "value": "application/json"}], "body": {"mode": "raw", "raw": "{\"email\": \"admin@university.edu\", \"password\": \"Pass1234!\"}"}, "url": {"raw": "{{base_url}}/api/auth/login/", "host": ["{{base_url}}"], "path": ["api", "auth", "login", ""]}}},
            {"name": "Me", "request": {"auth": {"type": "bearer", "bearer": [{"key": "token", "value": "{{student_token}}", "type": "string"}]}, "method": "GET", "url": {"raw": "{{base_url}}/api/auth/me/", "host": ["{{base_url}}"], "path": ["api", "auth", "me", ""]}}}
        ]},
        {"name": "Clubs", "item": [
            {"name": "List Clubs", "request": {"method": "GET", "url": {"raw": "{{base_url}}/api/clubs/", "host": ["{{base_url}}"], "path": ["api", "clubs", ""]}}},
            {"name": "Get Club by Slug", "request": {"method": "GET", "url": {"raw": "{{base_url}}/api/clubs/robotics-club/", "host": ["{{base_url}}"], "path": ["api", "clubs", "robotics-club", ""]}}},
            {"name": "Join Club (Student)", "request": {"auth": {"type": "bearer", "bearer": [{"key": "token", "value": "{{student_token}}", "type": "string"}]}, "method": "POST", "url": {"raw": "{{base_url}}/api/clubs/robotics-club/join/", "host": ["{{base_url}}"], "path": ["api", "clubs", "robotics-club", "join", ""]}}},
            {"name": "Club Members", "request": {"auth": {"type": "bearer", "bearer": [{"key": "token", "value": "{{student_token}}", "type": "string"}]}, "method": "GET", "url": {"raw": "{{base_url}}/api/clubs/robotics-club/members/", "host": ["{{base_url}}"], "path": ["api", "clubs", "robotics-club", "members", ""]}}}
        ]},
        {"name": "Memberships", "item": [
            {"name": "My Memberships", "request": {"auth": {"type": "bearer", "bearer": [{"key": "token", "value": "{{student_token}}", "type": "string"}]}, "method": "GET", "url": {"raw": "{{base_url}}/api/memberships/my/", "host": ["{{base_url}}"], "path": ["api", "memberships", "my", ""]}}}
        ]},
        {"name": "Manager", "item": [
            {"name": "Get Requests", "request": {"auth": {"type": "bearer", "bearer": [{"key": "token", "value": "{{manager_token}}", "type": "string"}]}, "method": "GET", "url": {"raw": "{{base_url}}/api/manager/membership-requests/", "host": ["{{base_url}}"], "path": ["api", "manager", "membership-requests", ""]}}}
        ]}
    ]
}

os.makedirs('../postman', exist_ok=True)
with open('../postman/University-Club-Directory.postman_collection.json', 'w') as f:
    json.dump(collection, f, indent=2)
print("Postman collection generated in /postman folder!")