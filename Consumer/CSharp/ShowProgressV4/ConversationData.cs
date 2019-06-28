

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
        public int Counter { get; set; } = 0;
        public bool Done { get; set; } = false;
        public TimeSpan Duration { get; set; } = TimeSpan.FromMilliseconds(0);
    }
}
