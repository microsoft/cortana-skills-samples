# Show Progress

This was a start at Show Progress V4 style.

In V4, we are supposed to be stateless.  That means we should use some external mechanism for storing/retrieving state - and that we should also relinquish control from the bot if we are not ready to do anything back to the cortana or bot service.  For example, when we send back "ignoringInput", Cortana shows thinking, and we should be able to tell the client to back off before a new request or event comes in (at which point we can see if our task is done and respond accordingly.)

Cortana doesn't facilitate this today.  In V3, we were able to create a polling loop (even though it looked event driven, it was still in process), and send 'please wait' style messages until the long running task was done.  Though we can do something similar in V4, Cortana will not reset its timeout when it receives a series of messages with inputHint = ignorinInput.  So, if the task takes more than 10 seconds, the Cortana client will disconnect and this is NOT what we want.

A bug is logged internally to correct this, but until the Cortana clients reset the timeout timer when they receive a message, we cannot support long running tasks using botframework V4.
