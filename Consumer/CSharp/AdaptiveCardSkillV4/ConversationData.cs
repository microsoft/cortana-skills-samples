

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Microsoft.BotBuilderSamples.Bots
{
    // Defines a state property used to track conversation data.
    public class ConversationData
    {
        // Track whether we have already asked the user's name
        public bool PromptedUser { get; set; } = false;
    }
}
