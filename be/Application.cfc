<cfcomponent
	displayname="Application"
	output="true"
	hint="Handle the application.">

    
	<!--- Set up the application. --->
	<cfset THIS.Name = "restgtcs" />
	<cfset THIS.ApplicationTimeout = CreateTimeSpan( 0, 12, 59, 59 ) />
	<cfset THIS.SessionManagement = true />
    <cfset this.sessionTimeout = CreateTimeSpan(0,0,59,59)>
	<cfset THIS.SetClientCookies = true />
	<cfset THIS.clientManagment = true />
	<cfset this.datasources["gtcs"] = {
        class: "com.mysql.cj.jdbc.Driver", 
        bundleName: "com.mysql.cj", 
        bundleVersion: "9.3.0",
        connectionString: "jdbc:mysql://4friends_mysql:3306/4friends?characterEncoding=UTF-8&serverTimezone=Etc/UTC&maxReconnects=3",
        username: "4friends_CF",
        password: "encrypted:e609eaef106c7c070478146ff6d4a19c0cc2e879e85bf9e3d43a24b0c731b6ff205748fbd1613e8a",
        
        // optional settings
        blob:true, // default: false
        clob:true, // default: false
        connectionLimit:-1, // default:-1
        liveTimeout:15, // default: -1; unit: minutes
        alwaysSetTimeout:true, // default: false
        validate:false // default: false
        
    }>

	
	<cfheader name="Access-Control-Allow-Origin" value="https://gtcs.quest">
    <cfheader name="Access-Control-Allow-Methods" value="POST, GET, OPTIONS">
    <cfheader name="Access-Control-Allow-Headers" value="Content-Type">
	<cfheader name="Access-Control-Allow-Credentials" value="true">
	
    <cffunction
        name="OnApplicationStart"
        access="public"
        returntype="boolean"
        output="false"
        hint="Fires when the application is first created.">
        
       <cfset application.datasource = "gtcs">
       <cfset this.datasources["gtcs"] = {
            class: "com.mysql.cj.jdbc.Driver", 
            bundleName: "com.mysql.cj", 
            bundleVersion: "9.3.0",
            connectionString: "jdbc:mysql://4friends_mysql:3306/4friends?characterEncoding=UTF-8&serverTimezone=Etc/UTC&maxReconnects=3",
            username: "4friends_CF",
            password: "encrypted:e609eaef106c7c070478146ff6d4a19c0cc2e879e85bf9e3d43a24b0c731b6ff205748fbd1613e8a",
            
            // optional settings
            blob:true, // default: false
            clob:true, // default: false
            connectionLimit:-1, // default:-1
            liveTimeout:15, // default: -1; unit: minutes
            alwaysSetTimeout:true, // default: false
            validate:false // default: false
            
        }>
        
        <cfreturn true />
    </cffunction>

    <cffunction name="onSessionStart" returntype="void">
        <!--- define all session variables, so they will always exist ---->
        <cfset clearSessionVariables()>
    </cffunction>

    <cffunction name="clearSessionVariables" returntype="void">
        <!--- defined all session variables, so they will always exist ---->
        <cfset session.auth = structNew()>
        <cfset session.auth.isLoggedIn  = false>
        <cfset session.auth.ID  = "">
        <cfset session.auth.Username   = "">
        <cfset session.auth.UserEmail    = "">
        <cfset session.auth.Password    = "">
        <cfset session.auth.Level  = "">
        <cfset session.auth.lastError  = "">
    </cffunction>


	<cffunction
		name="OnRequestStart"
		access="public"
		returntype="boolean"
		output="false"
		hint="Fires at first part of page processing.">

		<!--- Define arguments. --->
		<cfargument
			name="TargetPage"
			type="string"
			required="true"
			/>

		<!--- Return out. --->
		<cfreturn true />
	</cffunction>


<!---<cffunction
    name="OnRequest"
    access="public"
    returntype="void"
    output="true"
    hint="Fires after pre page processing is complete.">

    <cfargument
        name="TargetPage"
        type="string"
        required="true"
    />

    <!--- Check if the request is for a CFC, if so, directly include the page --->
    <cfif FindNoCase("/cfc/LoginUserMain.cfc", ARGUMENTS.TargetPage) OR FindNoCase("/cfc/registerUser.cfc", ARGUMENTS.TargetPage)>
        <cfinclude template="#ARGUMENTS.TargetPage#" />
        <cfreturn />
    </cfif>

    <!--- Create a variable to store user information --->
    <cfset var userInfo = {}>

    <!--- Simulate the getUserInfo function behavior --->

    <!--- Check if the token exists in cookies --->
    <cfif not structKeyExists(COOKIE, "TOKEN")>
        <cfset userInfo = {
            success: false,
            message: "Token not found in cookies",
            errorField: "TOKEN"
        }>
        <cfreturn />
    </cfif>

    <!--- Check if the token is valid and retrieve user information --->
    <cfset var incomingToken = trim(COOKIE.TOKEN)>
    <cfquery datasource="#application.dsource#" name="userToken">
        SELECT userid, expirationDate
        FROM userTokens
        WHERE token = <cfqueryparam value="#incomingToken#" cfsqltype="cf_sql_varchar">
            AND expirationDate > CURRENT_TIMESTAMP
    </cfquery>

    <!--- Check if token not found or expired --->
    <cfif userToken.recordCount eq 0>
        <cfset userInfo = {
            success: false,
            message: "Token not found or expired",
            errorField: "TOKEN"
        }>
        <cfreturn />
    </cfif>

    <!--- Retrieve user rooms information --->
    <cfset var allRooms = []>
    <cfquery datasource="#application.dsource#" name="getRooms">
        SELECT accounts.activeroomID, userRooms.roomID, rooms.name, accounts.username
        FROM accounts
        JOIN userRooms ON accounts.accountUniqueID = userRooms.userID
        JOIN rooms ON userRooms.roomID = rooms.id
        WHERE accounts.accountUniqueID = <cfqueryparam value="#userToken.userid#" cfsqltype="cf_sql_integer">
    </cfquery>

    <!--- Append room information to the allRooms array --->
    <cfloop query="getRooms">
        <cfset arrayAppend(allRooms, "#getRooms.roomID#. #getRooms.name#")>
    </cfloop>

    <!--- Store user information in userInfo struct if successful --->
    <cfset userInfo = {
        success: true,
        userid: userToken.userid,
        username: getRooms.username,
        activeRoom: getRooms.activeroomID,
        rooms: allRooms
    }>

    <!--- Store user information in session if successful --->
    <cfset SESSION.userid = userInfo.userid>
    <cfset SESSION.username = userInfo.username>
    <cfset SESSION.activeRoom = userInfo.activeRoom>
    <cfset SESSION.ALLROOMS = userInfo.rooms>

    <!--- Include the requested page --->
    <cfinclude template="#ARGUMENTS.TargetPage#" />

</cffunction>--->





	<cffunction
		name="OnRequestEnd"
		access="public"
		returntype="void"
		output="true"
		hint="Fires after the page processing is complete.">

		<!--- Return out. --->
		<cfreturn />
	</cffunction>


	<cffunction
		name="OnSessionEnd"
		access="public"
		returntype="void"
		output="false"
		hint="Fires when the session is terminated.">

		<!--- Define arguments. --->
		<cfargument
			name="SessionScope"
			type="struct"
			required="true"
			/>

		<cfargument
			name="ApplicationScope"
			type="struct"
			required="false"
			default="#StructNew()#"
			/>

		<!--- Return out. --->
		<cfreturn />
	</cffunction>


	<cffunction
		name="OnApplicationEnd"
		access="public"
		returntype="void"
		output="false"
		hint="Fires when the application is terminated.">

		<!--- Define arguments. --->
		<cfargument
			name="ApplicationScope"
			type="struct"
			required="false"
			default="#StructNew()#"
			/>

		<!--- Return out. --->
		<cfreturn />
	</cffunction>


	<cffunction
		name="OnError"
		access="public"
		returntype="void"
		output="true"
		hint="Fires when an exception occures that is not caught by a try/catch.">

		<!--- Define arguments. --->
		<cfargument
			name="Exception"
			type="any"
			required="true"
			/>

		<cfargument
			name="EventName"
			type="string"
			required="false"
			default=""
			/>
        <cfdump var="#Exception#"><cfabort>
		<!--- Return out. --->
		<cfreturn />
	</cffunction>

</cfcomponent>
