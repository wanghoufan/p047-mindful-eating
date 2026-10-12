package expo.modules.speechrecognizer

import android.app.Activity
import android.content.Context
import android.content.ComponentName
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Android SpeechRecognizer 桥接（可复用同一识别器，支持“持续聆听”）。
 * 只暴露能力探测、开始/停止/取消，事件 onPartial / onResult / onError / onEnd。
 * 不做音频存储、不联网、不自带第三方 ASR。
 */
class SpeechRecognizerModule : Module() {
  private var recognizer: SpeechRecognizer? = null
  private val main = Handler(Looper.getMainLooper())
  private val REQUEST_CODE = 9401

  private fun emit(name: String, body: Map<String, Any?>) {
    main.post { sendEvent(name, body) }
  }

  private fun errorCode(err: Int): String = when (err) {
    SpeechRecognizer.ERROR_NO_MATCH,
    SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "no_result"
    SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "permission"
    SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "busy"
    SpeechRecognizer.ERROR_NETWORK,
    SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "network"
    else -> "unavailable"
  }

  private fun firstText(results: Bundle?): String {
    val list = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
    return list?.firstOrNull().orEmpty()
  }

  private fun ensureRecognizer(ctx: Context): SpeechRecognizer {
    recognizer?.let { return it }
    val sr = SpeechRecognizer.createSpeechRecognizer(ctx)
    sr.setRecognitionListener(object : RecognitionListener {
      override fun onReadyForSpeech(params: Bundle?) {}
      override fun onBeginningOfSpeech() {}
      override fun onRmsChanged(rmsdB: Float) {}
      override fun onBufferReceived(buffer: ByteArray?) {}
      override fun onEndOfSpeech() { emit("onEnd", emptyMap<String, Any?>()) }
      override fun onPartialResults(partialResults: Bundle?) {
        val t = firstText(partialResults)
        if (t.isNotEmpty()) emit("onPartial", mapOf("text" to t))
      }
      override fun onResults(results: Bundle?) {
        emit("onResult", mapOf("text" to firstText(results)))
      }
      override fun onError(error: Int) {
        emit("onError", mapOf("code" to errorCode(error)))
      }
      override fun onEvent(eventType: Int, params: Bundle?) {}
    })
    recognizer = sr
    return sr
  }

  private fun buildIntent(locale: String): Intent =
    Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
      putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
      putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale)
      putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
      putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
      putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 3500L)
      putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 10000L)
      putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 1500L)
    }

  override fun definition() = ModuleDefinition {
    Name("SpeechRecognizer")

    Events("onPartial", "onResult", "onError", "onEnd")

    AsyncFunction("isAvailable") {
      val ctx = appContext.currentActivity ?: appContext.reactContext ?: return@AsyncFunction false
      SpeechRecognizer.isRecognitionAvailable(ctx)
    }

    AsyncFunction("isOnDeviceAvailable") {
      val ctx = appContext.currentActivity ?: appContext.reactContext ?: return@AsyncFunction false
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        SpeechRecognizer.isOnDeviceRecognitionAvailable(ctx)
      } else {
        false
      }
    }

    AsyncFunction("start") { locale: String ->
      val ctx = appContext.currentActivity ?: appContext.reactContext ?: return@AsyncFunction
      main.post {
        try {
          val sr = ensureRecognizer(ctx)
          sr.startListening(buildIntent(locale))
        } catch (e: Exception) {
          emit("onError", mapOf("code" to "unavailable"))
        }
      }
    }

    AsyncFunction("stop") {
      main.post { try { recognizer?.stopListening() } catch (_: Exception) {} }
    }

    AsyncFunction("cancel") {
      main.post { try { recognizer?.cancel() } catch (_: Exception) {} }
    }

    AsyncFunction("destroyRecognizer") {
      main.post {
        try { recognizer?.destroy() } catch (_: Exception) {}
        recognizer = null
      }
    }

    // 兜底：系统识别界面（RecognizerIntent / 小米 ASR Activity）
    AsyncFunction("startIntent") { locale: String ->
      val activity = appContext.currentActivity ?: return@AsyncFunction
      main.post {
        try {
          activity.startActivityForResult(buildIntent(locale), REQUEST_CODE)
        } catch (e: Exception) {
          emit("onError", mapOf("code" to "unavailable"))
        }
      }
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode != REQUEST_CODE) return@OnActivityResult
      if (payload.resultCode == Activity.RESULT_OK) {
        val text = payload.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull().orEmpty()
        if (text.isNotEmpty()) emit("onResult", mapOf("text" to text))
        else emit("onError", mapOf("code" to "no_result"))
      } else {
        emit("onError", mapOf("code" to "no_result"))
      }
    }

    OnDestroy {
      try { recognizer?.destroy() } catch (_: Exception) {}
      recognizer = null
    }
  }
}
