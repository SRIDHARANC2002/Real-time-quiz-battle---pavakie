# Fix 1v1 Battle Auto-Start Issue

## Tasks
- [x] Modify server/sockets/quizSocket.js to auto-start quiz when 2 players join a 1v1 room
- [x] Update client/pages/QuizRoom.jsx to hide start button for 1v1 rooms
- [x] Update waiting room message for 1v1 rooms
- [x] Test 1v1 room creation and joining
- [x] Verify quiz auto-starts when second player joins
- [x] Ensure multiplayer rooms still work with manual start
- [x] Check score updates and battle functionality

## Details
The 1v1 battle wasn't working because there was no auto-start logic for 1v1 rooms. The quiz only started when the host manually clicked "Start Quiz", but for 1v1 battles, it should automatically start when both players join.

## Files Modified
- server/sockets/quizSocket.js: Added auto-start logic in join-room event when 2 players are present in a 1v1 room
- client/pages/QuizRoom.jsx: Conditionally hide start button for 1v1 rooms and updated waiting room messages
