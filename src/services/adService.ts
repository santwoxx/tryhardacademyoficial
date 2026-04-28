import { AdMob, RewardAdOptions, AdLoadInfo, AdMobRewardItem } from '@capacitor-community/admob';

export class AdService {
  private static initialized = false;

  static async init() {
    if (this.initialized) return;
    try {
      await AdMob.initialize({});
      this.initialized = true;
      console.log('AdMob Initialized');
    } catch (e) {
      console.error('Failed to initialize AdMob', e);
    }
  }

  static async showRewardedAd(): Promise<number | null> {
    try {
      const options: RewardAdOptions = {
        adId: 'ca-app-pub-3940256099942544/5224354917', // Test ID
        // npx cap add android adds the necessary permissions
      };
      
      await AdMob.prepareRewardVideoAd(options);
      const reward = await AdMob.showRewardVideoAd();
      
      if (reward) {
        return (reward as AdMobRewardItem).amount;
      }
      return null;
    } catch (e) {
      console.error('Error showing rewarded ad', e);
      return null;
    }
  }

  static async showInterstitial(): Promise<void> {
    try {
      await AdMob.prepareInterstitial({
        adId: 'ca-app-pub-3940256099942544/1033173712', // Test ID
      });
      await AdMob.showInterstitial();
    } catch (e) {
      console.error('Error showing interstitial', e);
    }
  }
}
