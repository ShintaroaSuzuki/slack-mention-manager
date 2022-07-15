import { Injectable } from "@nestjs/common";
import { postNoReactionMentionedMessage } from "./slack/postMessage";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }

  mentionRemind(): void {
    postNoReactionMentionedMessage();
  }
}
