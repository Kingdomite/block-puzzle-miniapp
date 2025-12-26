import sdk from '@farcaster/frame-sdk';

let isInitialized = false;

export const initFarcaster = async () => {
  if (isInitialized) return;
  
  try {
    // Check if running inside Farcaster
    const context = await sdk.context;
    if (context) {
      console.log('✅ Running inside Farcaster frame');
      isInitialized = true;
      
      // Set frame ready
      sdk.actions.ready();
    }
  } catch (error) {
    console.log('Not running in Farcaster frame');
  }
};

export const isFarcasterFrame = () => {
  return typeof window !== 'undefined' && 
         (window as any).parent !== window;
};

export const openUrl = (url: string) => {
  if (isFarcasterFrame()) {
    sdk.actions.openUrl(url);
  } else {
    window.open(url, '_blank');
  }
};
