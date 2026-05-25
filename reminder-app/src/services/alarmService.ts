import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

class AlarmService {
  private sound: Audio.Sound | null = null;
  private vibrationInterval: NodeJS.Timeout | null = null;

  async start() {
    try {
      // 1. Start Sound (Looping)
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3' }, // Loud alarm sound
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      this.sound = sound;

      // 2. Start Vibration
      if (Platform.OS === 'android') {
        const PATTERN = [0, 500, 200, 500]; // wait, vibrate, wait, vibrate
        Vibration.vibrate(PATTERN, true);
      } else {
        this.vibrationInterval = setInterval(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }, 1000);
      }
      
      console.log('Alarm service started');
    } catch (error) {
      console.error('Error starting alarm service:', error);
    }
  }

  async stop() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
      
      Vibration.cancel();
      if (this.vibrationInterval) {
        clearInterval(this.vibrationInterval);
        this.vibrationInterval = null;
      }
      
      console.log('Alarm service stopped');
    } catch (error) {
      console.error('Error stopping alarm service:', error);
    }
  }
}

export const alarmService = new AlarmService();
