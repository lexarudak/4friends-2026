<cfcomponent>
    <cffunction name="getTotalPoints" access="remote" returntype="struct" returnformat="json" output="false">
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
            
            <cfif userToken.recordCount eq 0>
                <cfset result = {
                    success: false,
                    message: "Token not found or expired",
                    errorField: "TOKEN"
                }>
                <cfreturn result>
            </cfif>
            
            <cfset var userId = userToken.userid>
            
            <cfquery datasource="#application.datasource#" name="getActiveRoom">
                SELECT activeroomID
                FROM accounts
                WHERE accounts.accountUniqueID = <cfqueryparam value="#userId#" cfsqltype="cf_sql_integer">
            </cfquery>
            
            <cfquery datasource="#application.datasource#" name="getTotalPointsQuery">
                SELECT username, points
                FROM totalPoints
                WHERE roomID = <cfqueryparam value="#getActiveRoom.activeroomID#" cfsqltype="cf_sql_integer">
            </cfquery>
            
            <cfquery datasource="#application.datasource#" name="getAllPoints">
                SELECT username, MAX(points) AS totalPoints
                FROM totalPoints
                WHERE username != "admin"
                GROUP BY username
            </cfquery>
            
            <cfquery datasource="#application.datasource#" name="exactScoreHitsQuery">
                SELECT
                a.username,
                IFNULL( SUM( b.match_id IS NOT NULL AND b.GoalsTeam1 = m.GoalsTeam1 AND b.GoalsTeam2 = m.GoalsTeam2 ), 0 ) AS exactScoreHits 
                FROM
                accounts a
                JOIN allBetsEuro2024 b ON a.accountUniqueID = b.player_id 
                AND b.room_id = <cfqueryparam value="#getActiveRoom.activeroomID#" cfsqltype="cf_sql_integer">
                LEFT JOIN allMatchesEuro2024 m ON b.match_id = m.match_id 
                LEFT JOIN apiData p ON m.match_id  = p.match_id
                WHERE p.`status` = "Match Finished" OR p.`status` = "In Play"
                GROUP BY
                a.username;
            </cfquery>
            
            <cfquery datasource="#application.datasource#" name="predictedWinsQuery">
                SELECT accounts.username, IFNULL(SUM(bets.points_match > 0), 0) AS predictedWins
                FROM accounts
                JOIN allBetsEuro2024 bets ON accounts.accountUniqueID = bets.player_id AND bets.room_id = <cfqueryparam value="#getActiveRoom.activeroomID#" cfsqltype="cf_sql_integer">
                LEFT JOIN allMatchesEuro2024 matches ON bets.match_id = matches.match_id
                LEFT JOIN apiData p ON matches.match_id  = p.match_id
                WHERE p.`status` = "Match Finished" OR p.`status` = "In Play"
                GROUP BY accounts.username
            </cfquery>
            
            <cfquery datasource="#application.datasource#" name="averagePointsQuery">
                SELECT
                COUNT( DISTINCT bets.match_id ) AS totalMatches,
                SUM( bets.points_match ) AS totalPoints,
                accounts.username 
                FROM
                allBetsEuro2024 bets
                INNER JOIN accounts ON accounts.accountUniqueID = bets.player_id 
                LEFT JOIN apiData p ON bets.match_id  = p.match_id
                WHERE
                bets.room_id = <cfqueryparam value="#getActiveRoom.activeroomID#" cfsqltype="cf_sql_integer"> 
                AND (p.`status` = "Match Finished" OR p.`status` = "In Play")
                GROUP BY
                username
            </cfquery>
            
            <cfset result = {
                success: true,
                data: {
                    mainTable: [],
                    topAll: [],
                    exact: [],
                    wins: [],
                    average: []
                }
            }>

            <!-- Populate exact -->
            <cfloop query="exactScoreHitsQuery">
                <cfset arrayAppend(result.data.exact, {
                    username: exactScoreHitsQuery.username,
                    points: exactScoreHitsQuery.exactScoreHits
                })>
            </cfloop>

            <!-- Populate wins -->
            <cfloop query="predictedWinsQuery">
                <cfset arrayAppend(result.data.wins, {
                    username: predictedWinsQuery.username,
                    points: predictedWinsQuery.predictedWins
                })>
            </cfloop>

            <!-- Populate average -->
            <cfloop query="averagePointsQuery">
                <cfif averagePointsQuery.totalMatches GT 0 AND averagePointsQuery.totalPoints NEQ ''>
                    <cfset arrayAppend(result.data.average, {
                        username: averagePointsQuery.username,
                        points: numberFormat(averagePointsQuery.totalPoints / averagePointsQuery.totalMatches, "0.00")
                    })>
                <cfelse>
                    <cfset arrayAppend(result.data.average, {
                        username: averagePointsQuery.username,
                        points: 0
                    })>
                </cfif>
            </cfloop>

            <!-- Populate mainTable -->
            <cfloop query="getTotalPointsQuery">
                <cfset arrayAppend(result.data.mainTable, {
                    username: getTotalPointsQuery.username,
                    points: getTotalPointsQuery.points
                })>
            </cfloop>

            <!-- Populate topAll -->
            <cfloop query="getAllPoints">
                <cfset arrayAppend(result.data.topAll, {
                    username: getAllPoints.username,
                    points: getAllPoints.totalPoints
                })>
            </cfloop>

            <cfcatch type="Any">
                <!-- Capture and log any errors that occur -->
                <cfsavecontent variable="errorDump"><cfdump var="#cfcatch#"></cfsavecontent>
                <cfset requestData = getHttpRequestData().content>
                <cfset result = {
                    success: false,
                    message: "Error processing your request: " & cfcatch.message,
                    errorField: errorDump,
                    data: {}
                }>
            </cfcatch>
        </cftry>
        
        <cfreturn result />
    </cffunction>
</cfcomponent>
