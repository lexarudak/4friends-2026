<cfcomponent>
    <cffunction name="SaveAndGetMatches" access="remote" returntype="struct" returnformat="json">
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
                    SELECT datetime FROM allMatchesEuro2024 WHERE match_id = <cfqueryparam value="#data.matchid#" cfsqltype="cf_sql_integer">
                </cfquery>

                <cfif now() GT getMatchInfo.datetime>
                    <cfset varResult = {
                        success = false,
                        message = "Save failed. One or more selected matches have already started."
                    }>
                    <cfreturn varResult>
                </cfif>

                
                <cfquery name="checkBet" datasource="#application.datasource#">
                    SELECT COUNT(*) AS betCount FROM allBetsEuro2024
                    WHERE match_id = <cfqueryparam value="#data.matchid#" cfsqltype="cf_sql_integer">
                    AND player_id = <cfqueryparam value="#userId#" cfsqltype="cf_sql_integer">
                </cfquery>

               
                <cfset var isValidWinner = false> 

                <cfif data.team1.score GT data.team2.score AND data.winner is data.team1.code>
                    <cfset isValidWinner = true>
                <cfelseif data.team2.score GT data.team1.score AND data.winner is data.team2.code>
                    <cfset isValidWinner = true>
                <cfelseif data.team1.score eq data.team2.score AND (data.winner is data.team1.code OR data.winner is data.team2.code)>
                    <cfset isValidWinner = true>
                </cfif>

                <cfif NOT isValidWinner>
                    <cfset result = {
                        success = false,
                        message = "Error detected. Invalid winner data.",
                        errorField = "winner"
                    }>
                    <cfreturn result>
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
                            GoalsTeam1 = <cfqueryparam value="#data.team1.score#" cfsqltype="cf_sql_integer">,
                            Team2 = <cfqueryparam value="#data.team2.code#" cfsqltype="cf_sql_varchar">,
                            GoalsTeam2 = <cfqueryparam value="#data.team2.score#" cfsqltype="cf_sql_integer">,
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
</cfcomponent>