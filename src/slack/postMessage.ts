import { WebClient, ConversationsHistoryResponse } from "@slack/web-api";
import {
  getNoReactionMentionedHistories,
  formatMessageLinks,
} from "./getMessage";
import * as dotenv from "dotenv";
dotenv.config();

const client = new WebClient(process.env.SLACK_BOT_TOKEN);

export const postNoReactionMentionedMessage = async () => {
  const messageHistories = await getNoReactionMentionedHistories();
  const noReactedMessages = await formatMessageLinks(messageHistories);
  await client.chat.postMessage({
    text: noReactedMessages || "🎉 All mentions are reacted.",
    channel: process.env.SLACK_CHANNEL_ID,
  });
};
