/**
 * Native Bridge - ImobWeb 2026
 * 
 * Abstração para funcionalidades nativas, preparando o terreno
 * para wrappers Capacitor ou React Native WebView.
 */

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export class NativeBridge {
  /**
   * Captura a localização GPS do corretor durante a visita.
   * Faz o fallback automático para a Web Geolocation API se não houver bridge nativa.
   */
  static async getCurrentLocation(): Promise<Location> {
    console.log("[NativeBridge] Solicitando localização...");
    
    // Simulação de check por objeto injetado por wrapper nativo (ex: window.Capacitor)
    const isNative = (window as any).Capacitor || (window as any).ReactNativeWebView;

    if (isNative) {
      // Aqui chamaríamos o plugin nativo específico
      return { latitude: -19.9167, longitude: -43.9333, accuracy: 10 };
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }),
        (err) => reject(err),
        { enableHighAccuracy: true }
      );
    });
  }

  /**
   * Dispara um feedback tátil (Haptic Feedback) no dispositivo do corretor.
   */
  static async hapticFeedback(type: 'impact' | 'notification' | 'selection' = 'selection') {
    console.log(`[NativeBridge] Disparando haptic: ${type}`);
    
    // Web standard fallback (Navigator.vibrate)
    if ("vibrate" in navigator) {
      const patterns = {
        impact: [10],
        notification: [20, 50, 20],
        selection: [5]
      };
      navigator.vibrate(patterns[type]);
    }
  }

  /**
   * Solicita acesso à câmera nativa (mais performático que input file standard).
   */
  static async openCamera() {
    console.log("[NativeBridge] Abrindo interface de câmera nativa...");
    // Em um wrapper nativo, isso dispararia o sensor fotográfico direto sem UI de browser
  }
}
