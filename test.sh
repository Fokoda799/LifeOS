API=http://localhost:4000/api/v1
TOKEN=$(curl -s $API/auth/login -H 'content-type: application/json' -H 'x-client: mobile' \
  -d '{"email":"feyt2003@gmail.com","password":"wac2003A"}' | jq -r '.accessToken')
H="Authorization: Bearer $TOKEN"

curl -s $API/users/me/tools -H "$H"                      # {"tools":[]}
curl -s -X PUT $API/users/me/tools/money -H "$H"         # {"toolId":"money","addedAt":"..."}
curl -s $API/users/me/tools -H "$H"                      # one tool
curl -s -X PUT $API/users/me/tools/tasks -H "$H"         # 400 not available yet
curl -s -X PUT $API/users/me/tools/foo -H "$H"           # 400 validation
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE $API/users/me/tools/money -H "$H"   # 204
curl -s $API/users/me/tools -H "$H"                      # {"tools":[]}
curl -s -X PUT $API/users/me/tools/money -H "$H"         # same addedAt as before
curl -s -o /dev/null -w "%{http_code}\n" $API/users/me/tools   # 401 without a token
