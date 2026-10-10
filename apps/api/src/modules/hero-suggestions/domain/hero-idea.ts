export interface HeroIdea {
  name: string;
  nickname: string;
  dateOfBirth: string;
  universe: string;
  mainPower: string;
  backstory: string;
  avatarPrompt: string;
}

export interface GeneratedImage {
  content: Buffer;
}
