declare module 'insane' {
  export type AllowedTags = string;
  
  export interface InsaneOptions {
    allowedTags?: AllowedTags[];
    allowedAttributes?: Record<string, string[]>;
    [key: string]: any;
  }
  
  function insane(html: string, options?: InsaneOptions): string;
  
  export default insane;
} 