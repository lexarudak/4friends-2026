<cfcomponent>

<cffunction name="addRoomUser" access="remote" returntype="struct" returnformat="json">

   <cfargument name="roomname" type="string" required="false" hint="User password" />
            <cfset var varResult = structNew() />
            <cfset varResult['SUCCESS'] = false />
            <cfset var requestData = {} />
            <cfset var missingFields = []>
            <cfset var expectedFields = ["userid", "roomname"]>
            <cfset var isJsonRequest = false>
            
 <cfif not structKeyExists(COOKIE, "TOKEN")>
                <cfset varResult = {
                    success = false,
                    message = "Token not found in cookies",
                    errorField = "TOKEN"
                }>
                <cfreturn varResult>
            </cfif>

        <cfset var incomingToken = trim(COOKIE.TOKEN)>


            <cfquery datasource="#application.datasource#" name="userToken">
                SELECT userid, expirationDate
                FROM userTokens
                WHERE token = <cfqueryparam value="#incomingToken#" cfsqltype="cf_sql_varchar">
                AND expirationDate > CURRENT_TIMESTAMP
            </cfquery>

            <cfif userToken.recordCount eq 0>
                <cfset varResult = {
                    success = false,
                    message = "Token not found or expired",
                    errorField = "TOKEN"
                }>
                <cfreturn varResult>
            </cfif>

            <cfset var userId = userToken.userid>

            <cfquery name="getusername" datasource="#application.datasource#">
                SELECT username, activeRoomID FROM accounts WHERE accountUniqueID = <cfqueryparam value="#userid#" cfsqltype="cf_sql_integer">
            </cfquery>

    <cfset activeRoomID = getusername.activeRoomID>
    <cfset username = getusername.username>



    <cftry>

        
            <cfset requestData = deserializeJson(getHttpRequestData().content) />

            

            <cfif len(requestData) GT 0>
                    <cfset var isJsonRequest = true>
                    <cfset var jsonData = requestData>
                <cfif structKeyExists(jsonData, "userid")>
                    <cfset arguments.userid = jsonData.userid>
                </cfif>
                <cfif structKeyExists(jsonData, "roomname")>
                    <cfset arguments.roomname = jsonData.roomname>
                </cfif>
                <cfelse>
                    <cfset var isJsonRequest = false>
            </cfif>

                <cfloop array="#expectedFields#" index="field">
                    <cfif NOT structKeyExists(requestData, field)>
                        <cfset arrayAppend(missingFields, field)>
                    </cfif>
                </cfloop>

                <cfif arrayLen(missingFields)>
                    <cfset result = { 
                        success: false, 
                        message: "Missing fields: #arrayToList(missingFields, ', ')#",
                        errorField: "general",
                        missingFields: missingFields
                    }>
                    <cfreturn result>
                </cfif>

        <cfif isJsonRequest>
            <cfif structKeyExists(jsonData, "userid") AND jsonData.userid NEQ userId>
                <cfset varResult = {
                    success = false,
                    message = "Unauthorized access, " & username & ". Pay respect to fair play!",
                    errorField = "UserID Mismatch"
                }>
                <cfreturn varResult>
            </cfif>
        </cfif>

           <cfquery name="getRoomID" datasource="#application.datasource#">
               SELECT id, capacity FROM rooms WHERE name = <cfqueryparam value="#arguments.roomname#" cfsqltype="cf_sql_varchar">
            </cfquery>

            <cfquery name="checkRoomUser" datasource="#application.datasource#">
               SELECT COUNT(*) AS userRoomCount FROM userRooms WHERE userID = <cfqueryparam value="#arguments.userid#" cfsqltype="cf_sql_integer"> AND roomID = <cfqueryparam value="#getRoomID.id#" cfsqltype="cf_sql_integer">
            </cfquery>

            <cfquery name="checkRoomCapacity" datasource="#application.datasource#">
                SELECT COUNT(userID) as count FROM `userRooms`
                WHERE roomID = <cfqueryparam value="#getRoomID.id#" cfsqltype="CF_SQL_INTEGER">
            </cfquery>

            <cfif getRoomID.recordCount EQ 0>
               <cfset varResult['SUCCESS'] = false>
               <cfset varResult['MESSAGE'] = "Room does not exist">
               
            <cfelseif checkRoomCapacity.count GTE getRoomID.capacity>
                <cfset varResult['SUCCESS'] = false>
                <cfset varResult['MESSAGE'] = "The room is full">

            <cfelseif checkRoomUser.userRoomCount GT 0>
               <cfset varResult['SUCCESS'] = false>
               <cfset varResult['MESSAGE'] = "Room already added for the user">
            <cfelse>
           
               <cfquery name="relateRoomUser" datasource="#application.datasource#">
                  INSERT INTO userRooms (userID, roomID)
                  VALUES (
                        <cfqueryparam value="#userid#" cfsqltype="cf_sql_integer">,
                        <cfqueryparam value="#getRoomID.id#" cfsqltype="cf_sql_integer">
                  )
               </cfquery>

             

               <cfquery datasource="#application.datasource#">
                    INSERT INTO totalPoints (userID, username, points, roomID)
                    VALUES (
                        <cfqueryparam value="#arguments.userid#" cfsqltype="cf_sql_integer">,
                        <cfqueryparam value="#username#" cfsqltype="CF_SQL_VARCHAR">,
                        0,
                        <cfqueryparam value="#getRoomID.id#" cfsqltype="CF_SQL_INTEGER">
                    )
                </cfquery>

                <cfquery datasource="#application.datasource#">
                    INSERT INTO allBetsEuro2024 (room_id, player_id, match_id, Team1, Team2, createdDate, createdBy)
                    SELECT 
                        <cfqueryparam value="#getRoomID.id#" cfsqltype="CF_SQL_INTEGER">,
                        <cfqueryparam value="#arguments.userid#" cfsqltype="CF_SQL_INTEGER">,
                        match_id,
                        Team1,
                        Team2,
                        <cfqueryparam value="#Now()#" cfsqltype="CF_SQL_TIMESTAMP">,  
                        <cfqueryparam value="#username#" cfsqltype="CF_SQL_VARCHAR"> 
                    FROM allMatchesEuro2024
                </cfquery>
             
               <cfset varResult['SUCCESS'] = true>
            </cfif>



            <cfcatch type="Any">
            <cfsavecontent variable="test"><cfdump var="#cfcatch#"></cfsavecontent>
            
                  <cfset result = {
                     success: false,
                     message: "Error processing your request: " & cfcatch.message,
                     errorField: test
                  }>
            </cfcatch>
      </cftry>
         
        <cfreturn varResult />
    
</cffunction>

   <cffunction name="changeActiveRoom" access="remote" returntype="struct" returnformat="json">
    
   <cfargument name="userid" type="string" required="false" />
   <cfargument name="roomid" type="string" required="false" />
            <cfset var varResult = structNew() />
            <cfset varResult['SUCCESS'] = false />
            <cfset var requestData = {} />
            <cfset var missingFields = []>
            <cfset var expectedFields = ["userid", "roomid"]>
            <cfset var isJsonRequest = false>
            
    <cftry>
            <cfset requestData = deserializeJson(getHttpRequestData().content) />

            <cfif len(requestData) GT 0>
                    <cfset var isJsonRequest = true>
                    <cfset var jsonData = requestData>
                <cfif structKeyExists(jsonData, "userid")>
                    <cfset arguments.userid = jsonData.userid>
                </cfif>
                <cfif structKeyExists(jsonData, "roomid")>
                    <cfset arguments.roomid = jsonData.roomid>
                </cfif>
                <cfelse>
                    <cfset var isJsonRequest = false>
            </cfif>

                <cfloop array="#expectedFields#" index="field">
                    <cfif NOT structKeyExists(requestData, field)>
                        <cfset arrayAppend(missingFields, field)>
                    </cfif>
                </cfloop>

                <cfif arrayLen(missingFields)>
                    <cfset result = { 
                        success: false, 
                        message: "Missing fields: #arrayToList(missingFields, ', ')#",
                        errorField: "general",
                        missingFields: missingFields
                    }>
                    <cfreturn result>
                </cfif>

           
               <cfquery name="changeActiveRoom" datasource="#application.datasource#">
                  UPDATE accounts 
                  SET activeroomID = <cfqueryparam value="#arguments.roomid#" cfsqltype="cf_sql_integer">
                  WHERE accountUniqueID = <cfqueryparam value="#arguments.userid#" cfsqltype="cf_sql_integer">
               </cfquery>
             
               <cfset varResult['SUCCESS'] = true>



            <cfcatch type="Any">
            <cfsavecontent variable="test"><cfdump var="#cfcatch#"></cfsavecontent>
            
                  <cfset result = {
                     success: false,
                     message: "Error processing your request: " & cfcatch.message,
                     errorField: test
                  }>
            </cfcatch>
      </cftry>
         
        <cfreturn varResult />
    
    </cffunction>


<cffunction name="Save" access="remote" returntype="struct" returnformat="json">
      <cfset var varResult = {success = false} />

            <cfif not structKeyExists(COOKIE, "TOKEN")>
                <cfset varResult = {
                    success = false,
                    message = "Token not found in cookies",
                    errorField = "TOKEN"
                }>
                <cfreturn varResult>
            </cfif>

        <cfset var incomingToken = trim(COOKIE.TOKEN)>


            <cfquery datasource="#application.datasource#" name="userToken">
                SELECT userid, expirationDate
                FROM userTokens
                WHERE token = <cfqueryparam value="#incomingToken#" cfsqltype="cf_sql_varchar">
                AND expirationDate > CURRENT_TIMESTAMP
            </cfquery>

            <cfif userToken.recordCount eq 0>
                <cfset varResult = {
                    success = false,
                    message = "Token not found or expired",
                    errorField = "TOKEN"
                }>
                <cfreturn varResult>
            </cfif>

            <cfset var userId = userToken.userid>

            <cfquery name="getusername" datasource="#application.datasource#">
                SELECT username, activeRoomID FROM accounts WHERE accountUniqueID = <cfqueryparam value="#userid#" cfsqltype="cf_sql_integer">
            </cfquery>
             <cfset activeRoomID = getusername.activeRoomID>
             <cfset var username = getusername.username>

        
            <cfset var requestData = deserializeJson(getHttpRequestData().content) />
            <cfset var missingFields = []>

        <cfloop index="data" array="#requestData.data#">
            <cftry>
                <cfif data.userid NEQ userId>
                    <cfset varResult = {
                        success = false,
                        message = "Unauthorized access, " & username & ". Pay respect to fair play!",
                        errorField = "UserID Mismatch"
                    }>
                    <cfreturn varResult>
                </cfif>

               
                <cfquery name="getMatchInfo" datasource="#application.datasource#">
                    SELECT datetime, Team1, Team2, extra
                    FROM allMatchesEuro2024 
                    WHERE match_id = <cfqueryparam value="#data.matchid#" cfsqltype="cf_sql_integer">
                </cfquery>

                <cfif now() GT getMatchInfo.datetime>
                    <cfset varResult = {
                        success = false,
                        message = "Save failed. One or more selected matches have already started."
                    }>
                    <cfreturn varResult>
                </cfif>

                <cfif getMatchInfo.Team1 NEQ data.team1.code OR getMatchInfo.Team2 NEQ data.team2.code>
                    <cfset varResult = {
                        success = false,
                        message = "Error detected. Invalid team data.",
                        errorField = "Team"
                    }>
                    <cfreturn varResult>
                </cfif>

                
                <cfquery name="checkBet" datasource="#application.datasource#">
                    SELECT COUNT(*) AS betCount FROM allBetsEuro2024
                    WHERE match_id = <cfqueryparam value="#data.matchid#" cfsqltype="cf_sql_integer">
                    AND player_id = <cfqueryparam value="#userId#" cfsqltype="cf_sql_integer">
                </cfquery>

                <cfset var isValidWinner = false>


<cfif len(trim(data.team1.score)) GT 0 AND len(trim(data.team2.score)) GT 0>
    <cfif data.team1.score GT data.team2.score AND data.winner is data.team1.code>
        <cfset isValidWinner = true>
    <cfelseif data.team2.score GT data.team1.score AND data.winner is data.team2.code>
        <cfset isValidWinner = true>
    <cfelseif data.team1.score EQ data.team2.score>
  
        <cfif (isNull(data.winner) OR len(trim(data.winner)) EQ 0) OR (getMatchInfo.extra EQ 1 AND len(trim(data.winner)) GT 0)>
            <cfset isValidWinner = true>
        </cfif>
    </cfif>
<cfelseif len(trim(data.team1.score)) EQ 0 AND len(trim(data.team2.score)) EQ 0>
  
    <cfif isNull(data.winner) OR len(trim(data.winner)) EQ 0 OR (getMatchInfo.extra EQ 1 AND len(trim(data.winner)) GT 0)>
        <cfset isValidWinner = true>
    </cfif>
</cfif>


<cfif NOT isValidWinner>
    <cfset varResult = {
        success = false,
        message = "Error detected. Invalid winner data.",
        errorField = "winner"
    }>
    <cfreturn varResult>
</cfif>
                                        
                <cfif checkBet.betCount eq 0>
                   
                    <cfquery name="insertBet" datasource="#application.datasource#">
                        INSERT INTO allBetsEuro2024 (room_id, player_id, match_id, Team1, GoalsTeam1, GoalsTeam2, Team2, createdDate, createdBy, winner)
                    VALUES (
                        <cfqueryparam value="#activeRoomID#" cfsqltype="cf_sql_integer">,
                        <cfqueryparam value="#userid#" cfsqltype="cf_sql_integer">,
                        <cfqueryparam value="#data.matchid#" cfsqltype="cf_sql_integer">,
                        <cfqueryparam value="#data.team1.code#" cfsqltype="cf_sql_varchar">,
                        <cfqueryparam value="#data.team1.score#" cfsqltype="cf_sql_integer">,
                        <cfqueryparam value="#data.team2.score#" cfsqltype="cf_sql_integer">,
                        <cfqueryparam value="#data.team2.code#" cfsqltype="cf_sql_varchar">,
                        <cfqueryparam value="#now()#" cfsqltype="cf_sql_timestamp">,
                        <cfqueryparam value="#username#" cfsqltype="cf_sql_varchar">,
                        <cfqueryparam value="#data.winner#" cfsqltype="cf_sql_varchar">
                    )
                    </cfquery>

                <cfelse>
                  
                    <cfquery name="updateBet" datasource="#application.datasource#">
                    UPDATE allBetsEuro2024
                        SET 
                            Team1 = <cfqueryparam value="#data.team1.code#" cfsqltype="cf_sql_varchar">,
                            GoalsTeam1 = 
                                <cfif isDefined("data.team1.score") AND data.team1.score NEQ "">
                                    <cfqueryparam value="#data.team1.score#" cfsqltype="cf_sql_integer">
                                <cfelse>
                                    <cfqueryparam null="true" cfsqltype="cf_sql_integer">
                                </cfif>,
                            Team2 = <cfqueryparam value="#data.team2.code#" cfsqltype="cf_sql_varchar">,
                             GoalsTeam2 = 
                                <cfif isDefined("data.team2.score") AND data.team2.score NEQ "">
                                    <cfqueryparam value="#data.team2.score#" cfsqltype="cf_sql_integer">
                                <cfelse>
                                    <cfqueryparam null="true" cfsqltype="cf_sql_integer">
                                </cfif>,
                            winner = <cfqueryparam value="#data.winner#" cfsqltype="cf_sql_varchar">,
                            updatedBy = <cfqueryparam value="#username#" cfsqltype="cf_sql_varchar">,
                            updatedDate = <cfqueryparam value="#now()#" cfsqltype="cf_sql_timestamp">
                    WHERE match_id = <cfqueryparam value="#data.matchid#" cfsqltype="cf_sql_integer">
                    AND player_id = <cfqueryparam value="#data.userid#" cfsqltype="cf_sql_integer">
                    AND room_id = <cfqueryparam value="#activeroomID#" cfsqltype="cf_sql_integer">
                    </cfquery>
                </cfif>

            <cfcatch type="Any">
                <cfsavecontent variable="test"><cfdump var="#cfcatch#"></cfsavecontent>
                <cfset varResult = {
                    success = false,
                    message = "Error processing your request: " & cfcatch.message,
                    errorField = test
                }>
                <cfreturn varResult>
            </cfcatch>
            </cftry>
        </cfloop>

  <cftry>     
        <cfset matchesStruct = {}>
    
    <cfset now = now()>
    <cfset twentyFourHoursLater = dateAdd("h", 48, now)>
            
            <cfquery name="allMatchesQuery" datasource="#application.datasource#">
                    SELECT match_id, Team1, GoalsTeam1, GoalsTeam2, Team2, winner, extra, datetime, info
                    FROM allMatchesEuro2024
                    WHERE datetime BETWEEN <cfqueryparam value="#now#" cfsqltype="cf_sql_timestamp"> AND <cfqueryparam value="#twentyFourHoursLater#" cfsqltype="cf_sql_timestamp">
            </cfquery>

            
            <cfloop query="allMatchesQuery">

                <cfquery name="allBetsQuery" datasource="#application.datasource#">
                    SELECT GoalsTeam1, GoalsTeam2, Team1, Team2, winner
                    FROM allBetsEuro2024
                    WHERE match_id = <cfqueryparam value="#allMatchesQuery.match_id#" cfsqltype="cf_sql_integer">
                        AND player_id = <cfqueryparam value="#userid#" cfsqltype="cf_sql_integer"> 
                        AND room_id = <cfqueryparam value="#activeroomID#" cfsqltype="cf_sql_integer">
                </cfquery>

<!--- написать проверку для code --->

            <cfset servertime = Now() />

                <cfset matchStruct = {
                    "USERID": userid,
                    "MATCHID": allMatchesQuery.match_id,
                    "EXTRA": allMatchesQuery.extra == 1,
                    "WINNER": allBetsQuery.winner,
                    "INFO": allMatchesQuery.info,
                    "TIME": allMatchesQuery.datetime,
                    "SERVERTIME": servertime,
                    "TEAM1": {
                        "CODE": allMatchesQuery.Team1,
                        "SCORE": allBetsQuery.GoalsTeam1
                    },
                    "TEAM2": {
                        "CODE": allMatchesQuery.Team2,
                        "SCORE": allBetsQuery.GoalsTeam2
                    }
                }>

                
                <cfset matchesStruct[allMatchesQuery.match_id] = matchStruct>
            </cfloop>

           
            <cfset varresult = {
                SUCCESS: true,
                DATA: matchesStruct
            }>

        <cfcatch type="Any">
            <cfsavecontent variable="test"><cfdump var="#cfcatch#"></cfsavecontent>
            <cfset requestData = getHttpRequestData().content>
            <cfset result = {
                success: false,
                message: "Error processing your request: " & cfcatch.message,
                errorField: test
            }>
        </cfcatch>
    </cftry>

        <cfreturn varResult>
    </cffunction>


<cffunction name="getAllMatches" access="remote" returntype="struct" returnformat="json">

        <cfquery name="matchDetails" datasource="#application.datasource#">
            SELECT match_id, datetime
            FROM allMatchesEuro2024
            ORDER BY datetime ASC
        </cfquery>
        


        <cfset var dataRows = []>
        
        <cfloop query="matchDetails">
            <cfset var rowStruct = {
                "match_id" = matchDetails.match_id,
                "datetime" = matchDetails.datetime,
                "servertime" = now()
            }>
            <cfset arrayAppend(dataRows, rowStruct)>
        </cfloop>
        
        <cfset var varResult = {
            "SUCCESS" = true,
            "DATA" = dataRows
        }>

    <cfreturn varResult>

</cffunction>





    </cfcomponent>