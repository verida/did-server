# None of these should crash the server or fail to return
echo "Test no body in POST\n"
curl -H 'Content-Type: application/json'  -X POST http://localhost:5001/commit
echo "\n"
echo "Test JSON without expected fields"
curl -H 'Content-Type: application/json'  -X POST http://localhost:5001/commit -d @invalid_doc.json
echo "\n"
echo "Test invalid JSON"
curl -H 'Content-Type: application/json'  -X POST http://localhost:5001/commit -d @invalid_json.json
echo "\n"
echo "\n"
echo "Tests complete"