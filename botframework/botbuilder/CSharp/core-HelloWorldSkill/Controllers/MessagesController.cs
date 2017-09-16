using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Connector;

namespace HelloWorldSkill
{
	[BotAuthentication]
	public class MessagesController : ApiController
	{
		/// <summary>
		/// POST: api/Messages
		/// Receive a message from a user and reply to it
		/// </summary>
		public async Task<HttpResponseMessage> Post([FromBody]Activity activity)
		{
			if (activity.Type == ActivityTypes.ConversationUpdate || activity.Type == ActivityTypes.Message)
			{
				await Conversation.SendAsync(activity, () => new Dialogs.RootDialog());
			}

			var response = Request.CreateResponse(HttpStatusCode.OK);
			return response;
		}
		
	}
}