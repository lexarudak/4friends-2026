<cfcomponent>

    <cffunction name="registerUser" access="remote" returntype="struct" returnformat="json" output="false">

        <cfset var result = {}>
        <cfset var requestData = {}>
        <cfset var queryCheckUser = "">
        <cfset var queryRoomId = "">
        <cfset var roomId = 0>
        <cfset var missingFields = []>
        <cfset var expectedFields = ["login", "email", "password", "room"]>
        
    <cftry>
            
            <cfset requestData = deserializeJson(getHttpRequestData().content)>



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

            <cfset var salt = generateSecretKey("AES")>
            <cfset var hashedPassword = hash(requestData.password & salt, "SHA-256")>

            <cfquery name="queryCheckUser" datasource="#application.datasource#">
                SELECT 1 
                FROM accounts 
                WHERE username = <cfqueryparam value="#requestData.login#" cfsqltype="CF_SQL_VARCHAR"> 
                OR email = <cfqueryparam value="#requestData.email#" cfsqltype="CF_SQL_VARCHAR">
            </cfquery>

            <cfif queryCheckUser.recordCount > 0>
                <cfset result = {
                    success: false,
                    message: "Username or email already exists",
                    errorField: "login"
                }>
                <cfreturn result>
            </cfif>

            <cfquery name="queryRoomId" datasource="#application.datasource#">
                SELECT id, capacity 
                FROM rooms 
                WHERE name = <cfqueryparam value="#requestData.room#" cfsqltype="CF_SQL_VARCHAR">
            </cfquery>

            <cfif queryRoomId.recordCount == 0>
                <cfset result = {
                    success: false,
                    message: "Room does not exist",
                    errorField: "room"
                } >
                <cfreturn result>
            </cfif>

            <cfset roomId = queryRoomId.id>

            <cfquery name="checkRoomCapacity" datasource="#application.datasource#">
                SELECT COUNT(userID) as count FROM `userRooms`
                WHERE roomID = <cfqueryparam value="#roomId#" cfsqltype="CF_SQL_INTEGER">
            </cfquery>
            
            <cfif checkRoomCapacity.count GTE queryRoomId.capacity>
                <cfset result = {
                    success: false,
                    message: "The room is full",
                    errorField: "room"
                } >
                <cfreturn result>
            </cfif>
           
            
            <cfquery datasource="#application.datasource#">
                INSERT INTO accounts (email, username, password, salt, status, createdDate, activeroomID)
                VALUES (
                    <cfqueryparam value="#requestData.email#" cfsqltype="CF_SQL_VARCHAR">,
                    <cfqueryparam value="#requestData.login#" cfsqltype="CF_SQL_VARCHAR">,
                    <cfqueryparam value="#hashedPassword#" cfsqltype="CF_SQL_VARCHAR">,
                    <cfqueryparam value="#salt#" cfsqltype="CF_SQL_VARCHAR">,
                    1,
                    <cfqueryparam value="#Now()#" cfsqltype="CF_SQL_TIMESTAMP">,
                    <cfqueryparam value="#roomId#" cfsqltype="CF_SQL_INTEGER">
                )
            </cfquery>

        <cfset var userid = "">

            <cfquery name="getuserid" datasource="#application.datasource#">
                SELECT accountUniqueID, username 
                FROM accounts 
                WHERE email = <cfqueryparam value="#requestData.email#" cfsqltype="CF_SQL_VARCHAR">    
            </cfquery>

        <cfset var username = #getuserid.username#>
        <cfset var userid = #getuserid.accountUniqueID#>

            <cfquery datasource="#application.datasource#">
                INSERT INTO userRooms (userID, roomID)
                VALUES (
                    #userid#,
                    <cfqueryparam value="#roomId#" cfsqltype="CF_SQL_INTEGER">
                )
            </cfquery>

            <cfquery datasource="#application.datasource#">
                INSERT INTO totalPoints (userID, username, points, roomID)
                VALUES (
                    #userid#,
                    <cfqueryparam value="#requestData.login#" cfsqltype="CF_SQL_VARCHAR">,
                    0,
                    <cfqueryparam value="#roomId#" cfsqltype="CF_SQL_INTEGER">
                )
            </cfquery>

            <cfquery datasource="#application.datasource#">
                    INSERT INTO allBetsEuro2024 (room_id, player_id, match_id, Team1, Team2, createdDate, createdBy)
                    SELECT 
                        <cfqueryparam value="#roomId#" cfsqltype="CF_SQL_INTEGER">,
                        <cfqueryparam value="#userid#" cfsqltype="CF_SQL_INTEGER">,
                        match_id,
                        Team1,
                        Team2,
                        <cfqueryparam value="#Now()#" cfsqltype="CF_SQL_TIMESTAMP">,  
                        <cfqueryparam value="#username#" cfsqltype="CF_SQL_VARCHAR"> 
                    FROM allMatchesEuro2024
            </cfquery>
            
            <cfset result = { success: true, message: "Registration success" } >
            

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
    

<cfif result['success']>
        
    <cfinvoke component="loginUserMain" method="loginUser" returnvariable="loginResult">
        <cfinvokeargument name="email" value="#requestData.email#"/>
        <cfinvokeargument name="password" value="#requestData.password#"/>
    </cfinvoke>
    
    <cfset result['login'] = loginResult>
    
</cfif>
<cfreturn result />
</cffunction>

</cfcomponent>
