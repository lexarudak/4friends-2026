<cfcomponent>

    <cffunction name="getUsersBets" access="remote" returntype="struct" returnformat="json" output="false">
        <cfset var result = {}>
        <cfset var requestData = getHttpRequestData().content>
        <cfset var jsonRequestData = DeserializeJson(requestData)>
        <cfset var dateFrom = jsonRequestData.from>
        <cfset var dateTo = jsonRequestData.to>
        
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
<!---
    <cflock name="UpdateScores" timeout="30" type="exclusive">
        <cfquery datasource="#application.datasource#" name="updateScores">
                    UPDATE allMatchesEuro2024 a JOIN apiData b on a.match_id = b.match_id
                    SET a.GoalsTeam1 = b.goals_home, a.GoalsTeam2 = b.goals_away
                    WHERE a.match_id = b.match_id;
        </cfquery> 
    </cflock>
--->
    <cflock name="UpdatePointsLock" timeout="30" type="exclusive">
        <cfquery datasource="#application.datasource#" name="countPoints">
            UPDATE allBetsEuro2024 a
            JOIN allMatchesEuro2024 b ON a.match_id = b.match_id
            AND b.datetime <= NOW()
            SET a.points_match = 
                CASE
                    WHEN a.GoalsTeam1 = b.GoalsTeam1 AND a.GoalsTeam2 = b.GoalsTeam2 THEN 3
                    WHEN (a.GoalsTeam1 - a.GoalsTeam2 = b.GoalsTeam1 - b.GoalsTeam2) 
                        AND (a.GoalsTeam1 != b.GoalsTeam1) THEN 2
                    WHEN ((a.GoalsTeam1 > a.GoalsTeam2 AND b.GoalsTeam1 > b.GoalsTeam2) 
                        OR (a.GoalsTeam1 < a.GoalsTeam2 AND b.GoalsTeam1 < b.GoalsTeam2)) 
                        AND (a.GoalsTeam1 - a.GoalsTeam2 != b.GoalsTeam1 - b.GoalsTeam2) THEN 1
                    ELSE 0
                END,
                a.points_match_extra = CASE
                    WHEN b.extra = 1 AND a.winner = b.winner THEN 2
                    ELSE 0
                END;
              

        </cfquery>   

        <cfquery datasource="#application.datasource#" name="countTotalPoints">
            UPDATE `totalPoints` a
            JOIN (
                SELECT player_id, room_id, IFNULL(SUM(points_match + points_match_extra), 0) AS sum
                FROM `allBetsEuro2024`
                GROUP BY player_id, room_id
            ) b ON a.userID = b.player_id AND a.roomID = b.room_id
            SET a.points = b.sum
            WHERE a.userID = b.player_id AND a.roomID = b.room_id;
        </cfquery>
  
    </cflock>

    <cfquery datasource="#application.datasource#" name="getUsername">
        SELECT username
        FROM accounts
        WHERE accountUniqueID = <cfqueryparam value="#userid#" cfsqltype="cf_sql_integer">
    </cfquery>

    <cfset username = getUsername.username />

    <cflock name="UserDataQueryLock" timeout="20" type="readonly">
        <cfquery datasource="#application.datasource#" name="allbetsQuery">
            SELECT
                m.match_id,
                m.Team1 AS REAL_TEAM1,
                m.GoalsTeam1 AS REAL_GOALSTEAM1,
                m.GoalsTeam2 AS REAL_GOALSTEAM2,
                m.Team2 AS REAL_TEAM2,
                m.datetime,
                m.winner AS REAL_WINNER,
                m.info,
                m.extra,
                b.USERID,
                b.BET_TEAM1,
                b.BET_GOALSTEAM1,
                b.BET_GOALSTEAM2,
                b.BET_TEAM2,
                b.BET_WINNER,
                b.points_match,
                b.points_match_extra,
                b.username,
                d.status AS `LONG`,
                f.short AS SHORT,
                f.type AS TYPE,
                d.periods_first,
                d.periods_second
            FROM
                allMatchesEuro2024 m
                JOIN apiData d ON m.match_id = d.match_id
                JOIN fixturesStatus f ON d.status = f.long
                LEFT JOIN (
                    SELECT
                        a.username,
                        a.accountUniqueID as USERID,
                        b.match_id,
                        b.Team1 AS BET_TEAM1,
                        b.GoalsTeam1 AS BET_GOALSTEAM1,
                        b.GoalsTeam2 AS BET_GOALSTEAM2,
                        b.Team2 AS BET_TEAM2,
                        b.winner AS BET_WINNER,
                        b.points_match,
                        b.points_match_extra,
                        b.room_id
                    FROM
                        allBetsEuro2024 b
                        JOIN accounts a ON b.player_id = a.accountUniqueID
                    WHERE
                        b.room_id = #getActiveRoom.activeroomID#
                       <!--- AND b.match_id IN (
                            SELECT
                                d.match_id
                            FROM
                                apiData d
                            WHERE
                                d.status = "Match Finished" OR d.status = "In Play"
                        ) --->
                ) AS b ON m.match_id = b.match_id
            <!--- WHERE
                DATE(m.datetime) BETWEEN <cfqueryparam value="#dateFrom#" cfsqltype="cf_sql_timestamp"> AND <cfqueryparam value="#dateTo#" cfsqltype="cf_sql_timestamp">;--->
        </cfquery>
    </cflock>
             <cfset finalDataStruct = {}>

        <cfloop query="allbetsQuery">
            <cfset matchKey = "MATCHID: " & allbetsQuery.match_id>

            <cfif not structKeyExists(finalDataStruct, matchKey)>
                <cfset finalDataStruct[matchKey] = {
                    "TEAM1": {
                        "CODE": allbetsQuery.REAL_TEAM1,
                        "SCORE": allbetsQuery.REAL_GOALSTEAM1
                    },
                    "INFO": allbetsQuery.info,
                    "TIME": allbetsQuery.datetime,
                    "TEAM2": {
                        "CODE": allbetsQuery.REAL_TEAM2,
                        "SCORE": allbetsQuery.REAL_GOALSTEAM2
                    },
                    "EXTRA": allbetsQuery.extra EQ 1,
                    "WINNER": allbetsQuery.REAL_WINNER,
                    "STATUS": {
                        "SHORT": allbetsQuery.SHORT,
                        "LONG": allbetsQuery.LONG,
                        "TYPE": allbetsQuery.TYPE
                        },
                    "PERIODS": {
                        "PERIODS_FIRST": allbetsQuery.periods_first,
                        "PERIODS_SECOND": allbetsQuery.periods_second,
                        "SERVER_TIME": Now()},
                    "USER BETS": []
                }>
            </cfif>

            <cfset pointsMatch = val(allbetsQuery.points_match)>
            <cfset pointsMatchExtra = val(allbetsQuery.points_match_extra)>
     
            <cfset userBet = {
                "USERNAME": allbetsQuery.username,
                "TEAM1": {
                    "CODE": allbetsQuery.BET_TEAM1,
                    "SCORE": allbetsQuery.BET_GOALSTEAM1
                },
                "TEAM2": {
                    "CODE": allbetsQuery.BET_TEAM2,
                    "SCORE": allbetsQuery.BET_GOALSTEAM2
                },
                "WINNER": allbetsQuery.BET_WINNER,
                "POINTS": pointsMatch + pointsMatchExtra
            }>
            
            <cfif parseDateTime(allbetsQuery.datetime) LT now()>
                <cfset arrayAppend(finalDataStruct[matchKey]["USER BETS"], userBet)>
            </cfif>
        </cfloop>

        <cfset result = {
            "SUCCESS": true,
            "DATA": finalDataStruct
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

    <cfreturn result />
    </cffunction>

</cfcomponent>