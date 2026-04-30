<cfcomponent>

<cffunction name="getStandings" access="remote" returntype="struct" returnformat="json" output="false">
        <cfset var result = {}>

            <cfquery datasource="#application.datasource#" name="getStandings">
                SELECT `jsonstring`
                FROM standingsData
            </cfquery>

        <cfset result = {
                SUCCESS: true,
                DATA: getStandings.jsonstring
            }>

      <cfreturn result />
    </cffunction>
</cfcomponent>
