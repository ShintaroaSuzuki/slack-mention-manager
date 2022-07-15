import { WebClient, ConversationsHistoryResponse } from "@slack/web-api";
import * as dotenv from "dotenv";
dotenv.config();

const client = new WebClient(process.env.SLACK_USER_TOKEN);

export const getNoReactionMentionedHistories = async () => {
  const conversations = await client.conversations.list();
  const channels = conversations.channels;
  const messages = [];
  if (!channels) return;
  await Promise.all(
    channels.map((channel) =>
      (async () => {
        const result: ConversationsHistoryResponse =
          await client.conversations.history({
            channel: channel.id,
            limit: 1000,
          });
        messages.push({
          channelId: channel.id,
          messages: result.messages.filter(
            (message) =>
              message.type === "message" &&
              message.subtype === undefined &&
              message.text.includes(`<@${process.env.SLACK_USER_ID}>`) &&
              !checkReactions(message)
          ),
        });
      })()
    )
  );
  return messages;
};

export const formatMessageLinks = async (messageHistories) => {
  const messageLinks = [];
  await Promise.all(
    messageHistories.map((messageHistory) =>
      (async () => {
        await Promise.all(
          messageHistory.messages.map((message) =>
            (async () => {
              const result = await client.chat.getPermalink({
                channel: messageHistory.channelId,
                message_ts: message.ts,
              });
              messageLinks.push(result.permalink);
            })()
          )
        );
      })()
    )
  );
  return messageLinks.join("\n");
};

const checkReactions = (message) => {
  if (!message.reactions) return false;
  if (
    !message.reactions.filter(
      (reaction) => reaction.name === process.env.REACTION_NAME
    )[0]
  )
    return false;
  if (
    !message.reactions
      .filter((reaction) => reaction.name === process.env.REACTION_NAME)[0]
      .users.includes(process.env.SLACK_USER_ID)
  )
    return false;
  return true;
};
