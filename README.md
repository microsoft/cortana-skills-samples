# Cortana Skills Kit #

The **Cortana Skills Kit** is a suite of tools that helps you build custom, intelligent, personalized experiences for your users by empowering Cortana with new capabilities (or **skills**).

>Note: Cortana Skills Kit is currently in public preview.

Cortana skills can be built using the **Microsoft Bot Service**. The framework enables you to build conversational experiences that support different types of interactions with users. You can design freeform or guided interactions using simple text strings, speech or use complex rich cards that contain text, images, audio and action buttons.

Cortana Skills Kit also enables you to **personalize skill experiences** for your users by requesting for and leveraging contextual data like the user profile and location information.

*   Review the [Cortana Skills Kit documentation](https://docs.microsoft.com/en-us/cortana/getstarted) to get started!
*   Refer to the [Bot Framework documentation](https://docs.microsoft.com/en-us/bot-framework/) to create great conversational experiences
*   .NET and Node.js developers can take advantage of the [Bot Builder SDK](https://docs.microsoft.com/en-us/bot-framework/dotnet/bot-builder-dotnet-overview) to start creating Skills
*   Use the [Azure Free Trial](https://azure.microsoft.com/en-us/free/) to start free and keep going free - regardless of your subscription type

You can add **natural language understanding** to your skill by using the [Language Understanding Intelligent Service (LUIS)](https://www.luis.ai/), which uses the power of machine learning to help extract meaning from natural language input. A LUIS app takes a user utterance and extracts intents and entities that correspond to activities in your skill.

You can add **responsive UI** to your skill on devices with screens using [Adaptive Cards](https://adaptivecards.io/).

Also check out **Question and Answer Maker** that converts FAQs into bots in minutes via [QNAMaker](https://www.qnamaker.ai/).

# Samples #

In this repository, you will find task-focused samples to help you build skills for Cortana.
There are two areas; Consumer (third party) samples and Enterprise (Azure Active Directory) samples.
_Note: Enterprise skills tools and support are only offered to partners in Microsoft's Technology Adoption Program._

## Consumer ##

### CSharp ###
Task | Description | Action 
------------ | ------------- | :-----------:
Getting Started | A basic Hello World skill. | [View Sample](/Consumer/CSharp/HelloWorldSkill)
AdaptiveCards Skill | A demo skill showing the Calendar notification card with speech support. |  [View Sample](/Consumer/CSharp/AdaptiveCardSkill)
OAuth V2 | Demonstrate configuration of OAuth to get an Authorization token  | [View Sample](/Consumer/CSharp/OAuth2Example)
OAuth & Graph | Demonstrate OAuth to Graph connection to get information from Outlook contacts  | [View Sample](/Consumer/CSharp/OutlookGraph)
V3Patches | Diff files for key Azure portal templates to speak with Cortana | [View Patches](/Consumer/CSharp/V3Patches)
V4Patches | Diff files for key [bot samples](https://github.com/Microsoft/BotBuilder-Samples) to speak with Cortana | [View Patches](/Consumer/CSharp/V4Patches)


### Node ###
Task | Description | Action 
------------ | ------------- | :-----------:
AdaptiveCards Skill | A demo skill showing the Calendar notification card with speech support. |  [View Sample](/Consumer/Node/AdaptiveCardSkill)
OAuth V2 |  Demonstrate configuration of OAuth to get an Authorization token|  [View Sample](/Consumer/Node/OAuth2Example)
OAuth & Graph | Demonstrate OAuth to Graph connection to get information from Outlook contactss | [View Sample](/Consumer/Node/OutlookGraph)
V3Patches | Diff files for key Azure portal templates to speak with Cortana | [View Patches](/Consumer/Node/V3Patches)
V4Patches | Diff files for key [bot samples](https://github.com/Microsoft/BotBuilder-Samples) to speak with Cortana | [View Patches](/Consumer/Node/V4Patches)


## Enterprise ##
_This section is coming soon. Cortana Skills Kit for Enterprise is in the Technology Adoption program. Visit [this link](https://docs.microsoft.com/cortana/enterprise/overview) for more details._

# Support #

These resources provide additional information and support for developing Cortana Skills.

| Support type                    | Contact                                                
|----------------------------|---------------------------------
| _this repository_ | use the issues tab
|**Community support on StackOverflow** | [StackOverflow](https://stackoverflow.com/questions/tagged/cortana-skills-kit)
|**Community support on MSDN Social** | [MSDN](https://social.msdn.microsoft.com/Forums/en-US/home?category=cortana)
|**Bot Builder SDK issues/suggestions**| <a href="https://github.com/Microsoft/BotBuilder/" target="_blank">BotBuilder GitHub</a>

# Contributing #

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# Legal Notices #

Microsoft and any contributors grant you a license to the Microsoft documentation and other content
in this repository under the [Creative Commons Attribution 4.0 International Public License](https://creativecommons.org/licenses/by/4.0/legalcode),
see the [LICENSE](LICENSE) file, and grant you a license to any code in the repository under the [MIT License](https://opensource.org/licenses/MIT), see the
[LICENSE-CODE](LICENSE-CODE) file.

Microsoft, Windows, Microsoft Azure and/or other Microsoft products and services referenced in the documentation
may be either trademarks or registered trademarks of Microsoft in the United States and/or other countries.
The licenses for this project do not grant you rights to use any Microsoft names, logos, or trademarks.
Microsoft's general trademark guidelines can be found at http://go.microsoft.com/fwlink/?LinkID=254653.

Privacy information can be found at https://privacy.microsoft.com/en-us/

Microsoft and any contributors reserve all others rights, whether under their respective copyrights, patents,
or trademarks, whether by implication, estoppel or otherwise.
