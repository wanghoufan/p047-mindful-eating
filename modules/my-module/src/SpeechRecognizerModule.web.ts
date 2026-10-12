import { registerWebModule, NativeModule } from 'expo';

// SpeechRecognizerModule is not available on the web platform.
class SpeechRecognizerModule extends NativeModule<{}> {}

export default registerWebModule(SpeechRecognizerModule, 'SpeechRecognizerModule');
