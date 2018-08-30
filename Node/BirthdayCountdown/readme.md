
# Birthday Countdown #

Birthday Countdown is an example of using OAuth v2 and AAD v2 with Microsoft Graph. The skill, after authorizing the user, will open the user's outlook contacts and list out the days until their birthdays for up to five contacts in ascending order.

This demo shows
1. How to get the OAuth authorization token
1. How to use the token in a call to a protected resource
1. How to display an OAuth card if the token is missing

This work is based partially on the 2017 Build BirthdayBot example by [Nafis Zaman](https://github.com/navzam).

# Configuring OAuth and AAD v2 Converged Endpoint #

## Background ##
*What is the difference between Azure Active Directory v1 and v2?*
AAD v2 is a common, “converged” single endpoint for Microsoft identity management supporting individual Microsoft Accounts (MSAs) or enterprise managed accounts via OAuth2.  The biggest change is that scope is now managed across multiple Microsoft services to access resources (as opposed to specific resource authorization).  This means you can access SharePoint, Office365, OneDrive and more through one convenient endpoint (through Microsoft’s Graph API).

You can find more details on differences here:
* https://docs.microsoft.com/en-us/azure/active-directory/develop/azure-ad-endpoint-comparison 
* https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-compare
* https://blogs.msdn.microsoft.com/richard_dizeregas_blog/2015/09/04/working-with-the-converged-azure-ad-v2-app-model/
* https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-limitations 

You can see a list of all scopes for Microsoft Graph here:
* https://developer.microsoft.com/en-us/graph/docs/concepts/permissions_reference 

We recommend you use AAD v2 for development point forward, however if you are seeking details on how each protocol works:
* V1 – https://docs.microsoft.com/en-us/azure/active-directory/develop/v1-protocols-oauth-code 
* V2 – https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols 

If you are new to OAuth, you can read about the protocol here:
* https://tools.ietf.org/html/rfc6749

## Using AAD and Cortana ##
In the help [Adding Authentication to your Skill](https://docs.microsoft.com/en-us/cortana/skills/authentication) you saw how to use Connected Services to access an external OAuth identity provider or the AAD v2 endpoint with individual Microsoft Accounts (MSAs).  In this example, we will show how to configure an enterprise account to grant enterprise resource access to a skill.  In summary:
1. Create your skill as you did in previous examples with your MSA
1. Register an application using your enterprise AAD account via the Azure Portal or App Registration Portal
1. Discover your AAD tenant ID and include it in your OAuth requests when you use Cortana’s Connected Service
1. Select use tenant auth such that Cortana knows you’re accessing resources on a corporate domain

### Registering your Application ###
You are doing a double authentication when using enterprise resources.  The first authentication is between Cortana and the skill. The second one is where you talk to AAD to get a token for using the enterprise resource. This example will not cover the configuration of an AAD v1 application in detail.

There are two paths to create a new application.  

#### Path 1: Application Registration Portal ####
The user interface for this path is simpler but limited in what you can see and configure.  Use the registration portal if you’re a novice.
1. Visit https://apps.dev.microsoft.com and Sign in to your enterprise account 
1. You will see two sections for “Converged Applications” and “Azure AD only applications”.  Click the “Add an app” button for “Converged Applications” for AAD v2 (or select an existing one to edit) and record the application Id as your skill’s client Id under Cortana’s “Connected Services”
1. You will need to log in to https://ms.portal.azure.com to get your Azure tenant Id – by hovering over your name in the top right and copying down the “directory Id” (or using the Azure Active Directory -> Properties blade and clicking the copy button beside the directory Id)
1. Create a new secret key via the “Generate New Password” button and copy it down as this is what you will enter into the Cortana “Connected Services” client secret field
1.) Click “Add Platform” and add a “Web App” platform, adding your Cortana reply redirect (https://docs.microsoft.com/azure/active-directory/develop/active-directory-appmodel-v2-overview) 
1. Add any additional enterprise owners you want to have grant permission
1. Add “User.Read” and any other permissions to the resources you want available (see https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes for details on global and OpenID scopes)
1. Save the configuration

If you wish to create an AAD v1 application, click “Azure AD only applications”. You will be presented with a manifest editor.  Do not edit the manifest unless you have in-depth experience. Click on the “Edit in the Azure Portal” button. 

#### Path 2: Azure Portal ####
This path provides more detail and more capability to configure your resources. Use this if you are a power user and familiar with the Azure portal.
1. Directly log into the Azure portal via https://ms.portal.azure.com with your enterprise account  and click the “Azure Active Directory” blade 
1. Click the “App Registrations” blade
1. Click the endpoints menu tab and copy down the login, logout, oauth, and graph end points that conveniently include your tenant id that you can copy into Cortana’s “Manage user identity through Connected Services”.  Note, the default endpoint with be AAD v1. To use AAD v2 (converged), add /v2.0/ to your path i.e. https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token 
1. Click “+ New application registration” tab, enter your App name, “Web app /API” as the application type, and your botframework skill endpoint as the sign-on URL
1. Click the settings button
![settings](images/clip_image001.png)
And note your Application ID (as your Client Id).
1. Click the properties blade and fill in any empty fields for publishing.  (For example, TOS and Privacy statements are required to publish.)
1. Click on the Reply URLs blade and enter the Cortana and (optional) botframework URLs to register that these URLs are okay to call from the client 
![Reply URLs](images/clip_image002.png)
1. Click the Owners blade and add your domain account and any additional owners
1. Click on the Required permissions blade and grant any common permissions for selected services. Note, many enterprise resources will require an administrator to grant permissions so coordinate with your AAD administrator.  As an example, you can add “Windows Azure Active Directory” as the service and delegate “Sign in and read user profile” (Read.All) to test your own log in. If you want to share your Exchange profile, select “Office 365 Exchange Online” and grant “read all users basic profiles” (User.ReadBasic.All).  Remember to click the Grant permissions button.
1. Click on the Keys blade and create a new Client Secret. Use “BotLogin” as the description and copy down the secret immediately (as you will not be able to recover it.)  Anything in the value field is ignored on entry.
1. Return to the Cortana channel configuration and input your AAD client id, secret, and other noted fields.


### Calling Graph ###
You may now proceed to call Microsoft services!  

For AAD v1 (not recommended), 
* https://graph.windows.net/{tenant-identifier}/{resource-path}?[query-parameters]

For AAD v2 (converged, recommended),
* https://graph.microsoft.com/{version}/{resource}?[query-parameters]

For more information see https://developer.microsoft.com/en-us/graph/docs/concepts/use_the_api. 

You must pass the Authorization token along with the request to the protected resource on the HTTP header.

Node.js code example of getting the token from inside the skill request handler and calling graph to list OneDrive files for the logged in user:
```
var tokenEntity = session.message.entities.find((e) => {
    return e.type === 'AuthorizationToken';
    });
// check for no tokenEntity or an empty token (if expired) and put up an OAuthCard
        
// skill logic before the call to the resource

var url = 'https://graph.microsoft.com/v1.0/me/drive/root/children'; 
request.get(url, (err, response, body) => {
    if(err) console.log(err);
    // decode and operate on the body (payload)
    }).setHeader('Authorization', 'Bearer '+ tokenEntity['token'] );
```
 
## FAQ ##
*Q: Can I use common or me as AAD tenant or me as a resource?*
Yes.

*Q: How can I test OAuth with Cortana and Botframework?*
You if “on demand” is not selected, Cortana will perform the OAuth flow on invocation. You should see a log in page from your identity manager / authorization server next to the Cortana canvas. Your response Authorization header will then contain a token.
It very useful to test OAuth under botframework.  To do this, click the Settings blade of your Webb App bot and look at the bottom where it says OAuth Connection settings.  You can add settings for many Service Providers or pick the Generic OAuth 2 provider.  For AAD V2, pick that provider and enter your Client Id, Client Secret, Tenant Id, and scopes.  If you configured your resource provider correctly, click the “Test Connection” button will return you a token.
Note that you need to register the botframework redirection URI with the resource owner.

*Q: Why do I get a 400 error (bad request) after starting the OAuth flow.*
Check your redirect URL is authorized with the resource owner.

*Q: I get a 400 error saying my secret key is invalid during login.  What do I do?*
During development and redeployments the secret key can become invalid.  Through app registration, create a new secret key and register it with OAuth settings on the Cortana Channel.

*Q: Why do I get a 500 error (internal server error) or a “Cannot connect to the service” error via Cortana after initial login prompt?*
If you do not select “use tenant auth” in the Connected Services, Cortana will try and reuse your MSA credentials. If you have turned this on and still get the error, then a work around is to log in to Cortana from a device that is not on the same domain as your enterprise account.  (For example, if I write and deploy my skills on contoso.com using a MSA, I should try use my phone and telco provider’s internet connection to test my skill and log into my contoso.com domain account on my phone.)
