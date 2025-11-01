# Add Room Type Selection (1v1 vs Multiplayer)

## Tasks
- [x] Add roomType field to Room model
- [x] Update CreateRoom component to include room type selection
- [x] Update socket logic to enforce player limits based on room type
- [ ] Test room creation with different types

## Details
Currently the system supports multiple players but doesn't distinguish between 1v1 and multiplayer rooms. Need to add room type selection and enforce limits.

## Files to Edit
- server/models/Room.js: Add roomType field
- clint/pages/CreateRoom.jsx: Add room type selection UI in Step 1
- server/sockets/quizSocket.js: Add logic to restrict players based on room type
