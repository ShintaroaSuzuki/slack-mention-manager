import { WebClient, ConversationsHistoryResponse } from "@slack/web-api";
import {
  getNoReactionMentionedHistories,
  formatMessageLinks,
  getNoReactedMessages
} from "./getMessage";
import * as dotenv from "dotenv";
dotenv.config();

const client = new WebClient(process.env.SLACK_BOT_TOKEN);

export const postNoReactionMentionedMessage = async () => {
  const messageHistories = await getNoReactionMentionedHistories();
  const noReactedMessages = []
  await getNoReactedMessages(messageHistories, noReactedMessages)
  const formattedMessages = await formatMessageLinks(noReactedMessages);
  const messages = formattedMessages || "🎉 All mentions are reacted."
  await client.chat.postMessage({
    text: messages ,
    channel: process.env.SLACK_CHANNEL_ID,
  });
};
