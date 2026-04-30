<cfcomponent>

    <cffunction name="getNextMatches" access="remote" returntype="struct" returnformat="json" output="false">
        <cfset var result = {}>
        <cfset var requestData = {}>
        
        <cfif not structKeyExists(COOKIE, "TOKEN")>
                <cfset result = {
                    success: false,
                    message: "Token not found in cookies",
                    errorField: "TOKEN"
                }>
                <cfreturn result>
            </cfif>
    
        <cfset var incomingToken = trim(COOKIE.TOKEN)>
     <cftry>
                
        <cfquery datasource="#application.datasource#" name="userToken">
                SELECT userid, expirationDate
                FROM userTokens
                WHERE token = <cfqueryparam value="#incomingToken#" cfsqltype="cf_sql_varchar">
                    AND expirationDate > CURRENT_TIMESTAMP
        </cfquery>
    

         <cfquery datasource="#application.datasource#" name="getActiveRoom">
                SELECT activeroomID
                FROM accounts
                WHERE accountUniqueID = <cfqueryparam value="#userToken.userid#" cfsqltype="cf_sql_varchar">  
        </cfquery>
    
        <cfif userToken.recordCount eq 0>
                <cfset result = {
                    success: false,
                    message: "Token not found or expired",
                    errorField: "TOKEN"
                }>
                <cfreturn result>
        </cfif>
    
    <cfset userid = userToken.userid>
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
                        AND room_id = <cfqueryparam value="#getActiveRoom.activeroomID#" cfsqltype="cf_sql_integer">
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

           
            <cfset result = {
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

    <cfreturn result>
</cffunction>
</cfcomponent>