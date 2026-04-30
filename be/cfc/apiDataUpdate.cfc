<cfcomponent>
    <cffunction name="apiDataUpdate" access="remote" returntype="void">

        <cfquery name="getActiveMatches" datasource="#application.datasource#">
            SELECT a.*, d.status
            FROM allMatchesEuro2024 a JOIN apiData d on a.match_id = d.match_id
            WHERE a.datetime <= NOW()
            AND d.status != "Match Finished"
        </cfquery>

        <cfif getActiveMatches.RecordCount GT 0>
            <cfinvoke component="connectorapi" method="getFixturesEuro2024" returnvariable="apiResponse">
            </cfinvoke>
        </cfif>
  
    </cffunction>
</cfcomponent>
