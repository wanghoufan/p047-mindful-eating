// Re-export the native module. On web, it will be resolved to SpeechRecognizerModule.web.ts
// and on native platforms to SpeechRecognizerModule.ts
export { default } from './src/SpeechRecognizerModule';
export * from './src/SpeechRecognizer.types';
