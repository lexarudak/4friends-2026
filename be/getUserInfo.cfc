<cfcomponent>
<cffunction name="getUserInfo" access="remote" returntype="struct" returnformat="json" output="false">
    <cfset var result = {}>
    <cfset var requestData = {}>
    
    <cfif not structKeyExists(COOKIE, "TOKEN")>
            <cfset result = {
                success: false,
                message: "Token not found in cookies, please login",
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

<cfset USERID = userToken.userid>
<cfset ALLROOMS = {}>

    <cfquery datasource="#application.datasource#" name="getRooms">
        SELECT accounts.activeroomID, userRooms.roomID, rooms.name, accounts.username
        FROM accounts
        JOIN userRooms ON accounts.accountUniqueID = userRooms.userID
        JOIN rooms ON userRooms.roomID = rooms.id
        WHERE accounts.accountUniqueID = <cfqueryparam value="#userToken.userid#" cfsqltype="cf_sql_integer">
    </cfquery>


<cfset ALLROOMS = {}>
<cfloop query="getRooms">
    <cfset ALLROOMS[getRooms.roomID] = getRooms.name>
</cfloop>

    <cfset result = {
        success: true,
        userid: userToken.userid,
        data: {
            username: getRooms.username,
            activeroom: getRooms.activeroomID,
            rooms: ALLROOMS
    }
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
