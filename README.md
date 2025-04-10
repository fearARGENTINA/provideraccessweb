# Provider access web

Web developed (Front: ReactJS / Back: Python), to manage external resources access to the different buildings of a company.

The website is composed of three services:
- Frontend: developed in ReactJS, gives the ability to interact against the API graphically.
- Backend: developed with Python and Flask. It has authentication/authorization flow with roles for security purposes, and gives the different teams the ability to define an external provider entity and his multiple collaborators with attributes definitions like first and lastname, photo, occupation, etc., and based on this define the allowed access for this providers to the different physical buildings of a company leveraging JWT's, QR codes, card printing, and a graphical interface designed for the store manager to scan QR code.
- Filebeat: only for auditing purpose.
