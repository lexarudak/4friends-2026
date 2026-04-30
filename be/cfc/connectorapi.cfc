<cfcomponent>

    <cffunction name="init" access="public" returntype="FootballAPIConnector">
        <cfset this.apiKey = "989e4d8b1e87a40191a3756279ec12fe">
        <cfset this.apiHost = "v3.football.api-sports.io">
        <cfreturn this>
    </cffunction>

    
    <cffunction name="getApiKey" access="public" returntype="string">
        <cfreturn this.apiKey>
    </cffunction>

<cffunction name="processFixturesData" access="remote" returntype="void">
    <cfargument name="fixturesData" type="struct" required="yes">

    <cfloop array="#arguments.fixturesData.response#" index="fixture">
        <cfset periodsFirst = StructKeyExists(fixture.fixture, 'periods') AND StructKeyExists(fixture.fixture.periods, 'first') ? fixture.fixture.periods.first : 0>
        <cfset periodsSecond = StructKeyExists(fixture.fixture, 'periods') AND StructKeyExists(fixture.fixture.periods, 'second') ? fixture.fixture.periods.second : 0>
        
        <cfset winner = "none">
        <cfif StructKeyExists(fixture.teams.home, 'winner') AND StructKeyExists(fixture.teams.away, 'winner')>
            <cfif fixture.teams.home.winner>
                <cfset winner = fixture.teams.home.name> 
            <cfelseif fixture.teams.away.winner>
                <cfset winner = fixture.teams.away.name> 
            <cfelse>
                <cfset winner = "none">
            </cfif>
        <cfelse>
            <cfset goalsHome = StructKeyExists(fixture.goals, 'home') ? fixture.goals.home : 0>
            <cfset goalsAway = StructKeyExists(fixture.goals, 'away') ? fixture.goals.away : 0>
            <cfif goalsHome GT goalsAway>
                <cfset winner = fixture.teams.home.name> 
            <cfelseif goalsAway GT goalsHome>
                <cfset winner = fixture.teams.away.name> 
            <cfelse>
                <cfset winner = "draw"> 
            </cfif>
        </cfif>

        <cfif winner NEQ "none" AND winner NEQ "draw">
            <cfquery name="getCountryCode" datasource="#application.datasource#">
                SELECT code
                FROM countryCodeMapping
                WHERE name = <cfqueryparam value="#winner#" cfsqltype="CF_SQL_VARCHAR">
            </cfquery>
            <cfif getCountryCode.recordCount>
                <cfset winnerCode = getCountryCode.code>
            <cfelse>
                <cfset winnerCode = "UNK"> 
            </cfif>
        <cfelse>
            <cfset winnerCode = winner> 
        </cfif>

            <cfquery datasource="#application.datasource#">
                INSERT INTO apiData (
                    fixture_id,
                    fixture_date,
                    status,
                    league_name,
                    league_season,
                    league_round,
                    team_home_name,
                    team_away_name,
                    goals_home,
                    goals_away,
                    halftime_home,
                    halftime_away,
                    fulltime_home,
                    fulltime_away,
                    extratime_home,
                    extratime_away,
                    penalty_home,
                    penalty_away,
                    periods_first,
                    periods_second,
                    winner
                )
                VALUES (
                    <cfqueryparam value="#fixture.fixture.id#" cfsqltype="CF_SQL_BIGINT">,
                    <cfqueryparam value="#ParseDateTime(fixture.fixture.date)#" cfsqltype="CF_SQL_TIMESTAMP">,
                    <cfqueryparam value="#fixture.fixture.status.long#" cfsqltype="CF_SQL_VARCHAR">,
                    <cfqueryparam value="#fixture.league.name#" cfsqltype="CF_SQL_VARCHAR">,
                    <cfqueryparam value="#fixture.league.season#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#fixture.league.round#" cfsqltype="CF_SQL_VARCHAR">,
                    <cfqueryparam value="#StructKeyExists(fixture.teams.home, 'name') ? fixture.teams.home.name : ''#" cfsqltype="CF_SQL_VARCHAR">,
                    <cfqueryparam value="#StructKeyExists(fixture.teams.away, 'name') ? fixture.teams.away.name : ''#" cfsqltype="CF_SQL_VARCHAR">,
                    <cfqueryparam value="#StructKeyExists(fixture.goals, 'home') ? fixture.goals.home : 0#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#StructKeyExists(fixture.goals, 'away') ? fixture.goals.away : 0#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#StructKeyExists(fixture.score.halftime, 'home') ? fixture.score.halftime.home : 0#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#StructKeyExists(fixture.score.halftime, 'away') ? fixture.score.halftime.away : 0#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#StructKeyExists(fixture.score.fulltime, 'home') ? fixture.score.fulltime.home : 0#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#StructKeyExists(fixture.score.fulltime, 'away') ? fixture.score.fulltime.away : 0#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#StructKeyExists(fixture.score.extratime, 'home') ? fixture.score.extratime.home : 0#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#StructKeyExists(fixture.score.extratime, 'away') ? fixture.score.extratime.away : 0#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#StructKeyExists(fixture.score.penalty, 'home') ? fixture.score.penalty.home : 0#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#StructKeyExists(fixture.score.penalty, 'away') ? fixture.score.penalty.away : 0#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#periodsFirst#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#periodsSecond#" cfsqltype="CF_SQL_INTEGER">,
                    <cfqueryparam value="#winnerCode#" cfsqltype="CF_SQL_VARCHAR">
                )
                ON DUPLICATE KEY UPDATE
                    fixture_date = VALUES(fixture_date),
                    status = VALUES(status),
                    league_name = VALUES(league_name),
                    league_season = VALUES(league_season),
                    league_round = VALUES(league_round),
                    team_home_name = VALUES(team_home_name),
                    team_away_name = VALUES(team_away_name),
                    goals_home = VALUES(goals_home),
                    goals_away = VALUES(goals_away),
                    halftime_home = VALUES(halftime_home),
                    halftime_away = VALUES(halftime_away),
                    fulltime_home = VALUES(fulltime_home),
                    fulltime_away = VALUES(fulltime_away),
                    extratime_home = VALUES(extratime_home),
                    extratime_away = VALUES(extratime_away),
                    penalty_home = VALUES(penalty_home),
                    penalty_away = VALUES(penalty_away),
                    periods_first = VALUES(periods_first),
                    periods_second = VALUES(periods_second),
                    winner = VALUES(winner)
            </cfquery> 
    </cfloop>
        <cfquery datasource="#application.datasource#">
            UPDATE allMatchesEuro2024 a
            JOIN apiData b ON a.match_id = b.match_id
            SET a.GoalsTeam1 = b.goals_home,
                a.GoalsTeam2 = b.goals_away,
                a.winner = b.winner
        </cfquery>
</cffunction>

   

    <cffunction name="getFixturesEuro2024" access="remote" returntype="struct" httpmethod="GET" returnformat="json">
        <cfhttp method="get" url="https://v3.football.api-sports.io/fixtures" result="httpResponse">
            <cfhttpparam type="header" name="x-rapidapi-key" value="989e4d8b1e87a40191a3756279ec12fe">
            <cfhttpparam type="header" name="x-rapidapi-host" value="v3.football.api-sports.io">
            <cfhttpparam type="url" name="league" value="4">
            <cfhttpparam type="url" name="season" value="2024">
            <cfhttpparam type="url" name="from" value="2024-06-12">
            <cfhttpparam type="url" name="to" value="2025-06-12">
        </cfhttp>
        
        <cfset jsonResponse = deserializeJSON(httpResponse.filecontent)>
        <cfset processFixturesData(jsonResponse)>
       <cfreturn jsonResponse>
    </cffunction>

    <cffunction name="getStandingsEuro2024" access="remote" returntype="struct" httpmethod="GET" returnformat="json">
        <cfhttp method="get" url="https://v3.football.api-sports.io/standings" result="httpResponse">
            <cfhttpparam type="header" name="x-rapidapi-key" value="989e4d8b1e87a40191a3756279ec12fe">
            <cfhttpparam type="header" name="x-rapidapi-host" value="v3.football.api-sports.io">
            <cfhttpparam type="url" name="league" value="4">
            <cfhttpparam type="url" name="season" value="2024">
        </cfhttp>
        
        <cfset jsonResponse = deserializeJSON(httpResponse.filecontent)>

       
        <cfset jsonString = serializeJSON(jsonResponse)>

    
        <cfquery datasource="#application.datasource#">
            UPDATE standingsData
            SET jsonstring = <cfqueryparam value="#jsonString#" cfsqltype="cf_sql_longvarchar">
        </cfquery>
        
       <cfreturn jsonResponse>

    </cffunction>


</cfcomponent>

