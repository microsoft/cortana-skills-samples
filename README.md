# Cortana Skills Kit

The **Cortana Skills Kit** is a suite of tools that helps you build custom, intelligent, personalized experiences for your users by empowering Cortana with new capabilities (or **skills**).

>Note: Cortana Skills Kit is currently in public preview.

Cortana skills can be built using the **Microsoft Bot Framework**. The Framework enables you to build conversational experiences that support different types of interactions with users. You can design freeform or guided interactions using simple text strings, speech or use complex rich cards that contain text, images, audio and action buttons.

Cortana Skills Kit also enables you to **personalize skill experiences** for your users by requesting for and leveraging contextual data like the user profile and location information.

*   Review the [Cortana Skills Kit documentation](https://docs.microsoft.com/en-us/cortana/getstarted) to get started!
*   Refer to the [Bot Framework documentation](https://docs.microsoft.com/en-us/bot-framework/) to create great conversational experiences
*   .NET and Node.js developers can take advantage of the [Bot Builder SDK](https://docs.microsoft.com/en-us/bot-framework/dotnet/bot-builder-dotnet-overview) to start creating Skills
*   Use the [Azure Free Trial](https://azure.microsoft.com/en-us/free/) to start free and keep going free - regardless of your subscription type

You can add **natural language understanding** to your skill by using the [Language Understanding Intelligent Service (LUIS)](https://www.luis.ai/), which uses the power of machine learning to help extract meaning from natural language input. A LUIS app takes a user utterance and extracts intents and entities that correspond to activities in your skill.

# Samples

In this repository, you will find task-focused samples to help you build skills for Cortana.

## CSharp ##
Sample | Description | Action 
------------ | ------------- | :-----------:
AdaptiveCards | Demonstrate how to build an adaptive card and respond to a submit action | [View Sample](/CSharp/AdaptiveCards)
Hello World | A basic Hello World skill. | [View Sample](/CSharp/HelloWorldSkill)
BirthdayCountdown | Demonstrate OAuth Graph connection to get information from contacts  | [View Sample](/CSharp/BirthdayCountdownCS)



## Node ##
Sample | Description | Action 
------------ | ------------- | :-----------:
BirthdayCountdown | Demonstrate OAuth Graph connection to get information from contacts |  [View Sample](/Node/BirthdayCountdown)
MapSearch | Demonstrate deep link into Microsoft Map to search a location (and check device has a screen) |  [View Sample](/Node/MapSearch)


# Support

These resources provide additional information and support for developing Cortana Skills.

|Support type                    | Contact                                                
|----------------------------|---------------------------------
|**Community support** | [StackOverflow](https://stackoverflow.com/questions/tagged/cortana-skills-kit)
|**Using a Cortana Skill** | Contact the skill developer through their publisher e-mail                 
|**Bot Builder SDK issues/suggestions**| Use the issues tab on the <a href="https://github.com/Microsoft/BotBuilder/" target="_blank">GitHub repo</a>
|**Reporting abuse**| Contact us at [csk-reports@microsoft.com](mailto://csk-reports@microsoft.com)

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# Legal Notices

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
