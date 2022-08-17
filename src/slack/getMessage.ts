import { WebClient, ConversationsHistoryResponse } from "@slack/web-api";
import * as dotenv from "dotenv";
dotenv.config();

const client = new WebClient(process.env.SLACK_USER_TOKEN);

export const getNoReactionMentionedHistories = async () => {
  const conversations = await client.conversations.list({
    limit: 10000
  });
  const channels = conversations.channels.filter((c) => c.is_archived == false && c.is_member == true);
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
              message.text.includes(`<@${process.env.SLACK_USER_ID}>`)
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
        const result = await client.chat.getPermalink({
          channel: messageHistory.channelId,
          message_ts: messageHistory.message.ts,
        });
        messageLinks.push(result.permalink);
      })()
    )
  );
  return messageLinks.join("\n");
};

export const getNoReactedMessages = async (messageHistories, extractedMessages) => {
  await Promise.all(
    messageHistories.map((history) => (async () => {
      await extractNoReactMessage(history.messages, history.channelId, extractedMessages)
    })()
  ))
}

const extractNoReactMessage = async (messages, channelId, extractedMessages) => {
  await Promise.all(
    messages.map((message) => (async () => {
      let reactionExisted = await checkReactions(message)
      if (!reactionExisted) {
        extractedMessages.push({
          channelId,
          message
        })
      }
    })()
  ))
} 

const checkReactions = async (message) => {
  if (!message.reactions) {return false};
  if (
    message.reactions.filter(
      (reaction) => reaction.name == process.env.REACTION_NAME
    ).length == 0
  )
    {return false};
  if (
    !message.reactions
      .filter((reaction) => reaction.name == process.env.REACTION_NAME)[0]
      .users.includes(process.env.SLACK_USER_ID)
  )
    {return false};
  return true;
};
