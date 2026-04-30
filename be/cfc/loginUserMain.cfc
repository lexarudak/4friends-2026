<cfcomponent displayname="LoginUser" hint="This component provides API for user login" output="no">

    <cffunction name="loginUser" access="remote" returntype="struct" returnformat="json" output="false">
        <cfargument name="email" type="string" required="false" hint="User email" />
        <cfargument name="password" type="string" required="false" hint="User password" />
            <cfset var varResult = structNew() />
            <cfset varResult['SUCCESS'] = false />
            <cfset var requestData = {} />
            <cfset var missingFields = []>
            <cfset var expectedFields = ["email", "password"]>
            <cfset var isJsonRequest = false>
            
    <cftry>
            <cfset requestData = deserializeJson(getHttpRequestData().content) />

            <cfif len(requestData) GT 0>
                    <cfset var isJsonRequest = true>
                    <cfset var jsonData = requestData>
                <cfif structKeyExists(jsonData, "email")>
                    <cfset arguments.email = jsonData.email>
                </cfif>
                <cfif structKeyExists(jsonData, "password")>
                    <cfset arguments.password = jsonData.password>
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
                        message: "Отсутствуют обязательные поля: #arrayToList(missingFields, ', ')#",
                        errorField: "general",
                        missingFields: missingFields
                    }>
                    <cfreturn result>
                </cfif>
            
            <cfquery name="queryCheckUser" datasource="#application.datasource#">
                SELECT email, password, salt, accesslevel, accountUniqueID
                FROM accounts
                WHERE email = <cfqueryparam value="#arguments.email#" cfsqltype="CF_SQL_VARCHAR">
            </cfquery>
            
            <cfif queryCheckUser.recordCount == 0>
                <cfset varResult['SUCCESS'] = false />
                <cfset varResult['MESSAGE'] = "User does not exist in database" />
                <cfset varResult['ERRORFIELD'] = "email" />
                <cfset varResult['DATA'] = "" />
                <cfreturn varResult />
            <cfelse>
                <cfset var hashedPassword = hash(arguments.password & queryCheckUser.salt, "SHA-256")>
                
                <cfif hashedPassword EQ queryCheckUser.password>
                    <cfset uuid = createUUID()>
                    <cfset timestamp = now()>
                    <cfset accountId = queryCheckUser.accountUniqueID>

                    <cfset token = hash(uuid & "_" & dateFormat(timestamp, 'yyyy-mm-dd') & " " & timeFormat(timestamp, 'HH:mm:ss') & "_" & accountId, "SHA-256")>
                    <cfset var expirationDate = dateAdd("m", 1, now())>

                        <cfquery name="InsertToken" datasource="#application.datasource#">
                                INSERT INTO userTokens (userID, token, expirationDate, ip, browser)
                                VALUES (
                                    <cfqueryparam value="#queryCheckUser.accountUniqueID#" cfsqltype="CF_SQL_INTEGER">,
                                    <cfqueryparam value="#token#" cfsqltype="CF_SQL_VARCHAR">,
                                    <cfqueryparam value="#dateAdd('m', 1, now())#" cfsqltype="CF_SQL_TIMESTAMP">,
                                    <cfqueryparam value="#cgi.remote_addr#" cfsqltype="CF_SQL_VARCHAR">,
                                    <cfqueryparam value="#cgi.http_user_agent#" cfsqltype="CF_SQL_VARCHAR">
                                )
                        </cfquery>

                    <cfcookie name="token" value="#token#" expires="#expirationDate#" domain="4friends.live" />

                    <cfset varResult['SUCCESS'] = true >
                    <cfset varResult['MESSAGE'] = "Login successful" >
                    <cfset varResult['TOKEN'] = token >
                    <cfset varResult['ACCESSLEVEL'] = queryCheckUser.accesslevel>
                    <cfset varResult['DATA'] = "" />
                <cfelse>
                    <cfset varResult['SUCCESS'] = false />
                    <cfset varResult['MESSAGE'] = "Invalid password" />
                    <cfset varResult['ERRORFIELD'] = "password" />
                    <cfset varResult['DATA'] = "" />
                </cfif>
            </cfif>
            
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

        <cfreturn varResult />
    </cffunction>


</cfcomponent>
