import { NativeModule, requireNativeModule } from 'expo';

declare class SpeechRecognizerModule extends NativeModule<{}> {}

export default requireNativeModule<SpeechRecognizerModule>('SpeechRecognizer');
