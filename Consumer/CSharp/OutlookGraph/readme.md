
# Microsoft Graph and Outlook #

Birthday Countdown is an example of using OAuth v2 and AAD v2 with Microsoft Graph. The skill, after authorizing the user, will open the user's outlook contacts and list out the days until their birthdays for up to ten contacts in ascending order of the countdown.

This demo builds upon the [OAuthExample](../OAuth2Example) and shows
1. How to get the OAuth authorization token
1. How to use the token in a call to a protected resource
1. How to display an OAuth card if the token is missing

## Prework ##
You must configure the Cortana channel (via the **Manager user identity through Connected Services** under **Default Settings**)
and Graph (through the **[Application Registration Portal](https://apps.dev.microsoft.com)**, **Web Platform**, and **Microsoft Graph Permissions**.)

## Calling Microsoft Graph ##

[Follow these instructions](https://docs.microsoft.com/en-us/cortana/skills/authentication) to configure Cortana
to connect to a service with OAuth v2.

For more information on using Graph see [Use the API](https://developer.microsoft.com/en-us/graph/docs/concepts/use_the_api). 

[Follow this reference](https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/resources/contact) 
to see what is available in the Microsoft Graph API.

[Also follow this reference](https://developer.microsoft.com/en-us/graph/docs/concepts/query_parameters)
to discover how to query resources in Microsoft Graph.

You can test your Graph queries with [the graph explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) test tool.

--- 

The pattern for calling AAD v2 resources is,

``` https://graph.microsoft.com/{version}/{tenant-identifier}/{resource}?[query-parameters]```

This line gets the data:
```
 var url = 'https://graph.microsoft.com/v1.0/me/contacts?select=birthday,nickName,surname,givenName';
```    
    
You must pass the Authorization token along with the request to the protected resource on the HTTP header.

This line signs the request with authorization:
```
request.get(...).setHeader('Authorization', 'Bearer ' + tokenEntity['token']);
```


 
## FAQ ##
*Q: Can I use common or **me** as AAD tenant or me as a resource?*

Yes. You will see the example URL uses **me** for the tenant.

*Q: How can I test OAuth with Cortana and Botframework?*

If “on invocation” is selected, Cortana will perform the OAuth flow on invocation of the skill. You should see a log in page from your identity manager / authorization server next to the Cortana canvas. Your response Authorization header will then contain a token.

It very useful to test OAuth under botframework.  To do this, click the Settings blade of your Web App bot and look at the bottom where it says OAuth Connection settings.  You can add settings for many Service Providers or pick the Generic OAuth 2 provider.  For AAD V2, pick that provider and enter your Client Id, Client Secret, Tenant Id, and scopes.  If you configured your resource provider correctly, click the “Test Connection” button will return you a token.
Note that you need to register the botframework redirection URI with the resource owner.
